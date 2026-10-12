"use server";

import prisma from "@/src/lib/prisma";
import { getSessionUser, requireVerifiedOrg } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Invoice } from "@/src/generated/prisma/client";

const createInvoiceSchema = z.object({
  residentId: z.string().min(1, "Resident ID is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than zero"),
  dueDate: z.string().nullish(),
});

const initializePaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
});

export async function createInvoice(_prevState: unknown, formData: FormData): Promise<ActionResult<Invoice>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const raw = {
    residentId: formData.get("residentId"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
  };

  const parsed = createInvoiceSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const resident = await prisma.user.findFirst({
    where: { id: parsed.data.residentId, organizationId: user.organizationId, role: "RESIDENT" },
    select: { id: true, phone: true },
  });

  if (!resident) return fail("Resident not found");

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: user.organizationId,
      residentId: parsed.data.residentId,
      invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
      amount: parsed.data.amount,
      currency: "NGN",
      status: "DRAFT",
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  revalidatePath("/dashboard/admin/invoices");

  return ok(invoice);
}

export async function initializePayment(_prevState: unknown, formData: FormData): Promise<ActionResult<{ authorizationUrl: string }>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN" && user.role !== "RESIDENT") return fail("Forbidden");

  const verified = await requireVerifiedOrg(user);
  if (verified.status === "SUSPENDED") {
    return fail("Organization is suspended; payment collection is temporarily locked");
  }
  if (!verified.verified && process.env.NODE_ENV === "production" && user.role !== "RESIDENT") {
    return fail(
      `Organization is ${verified.status.replace("_", " ").toLowerCase()}; Paystack payments are locked pending verification`
    );
  }

  const raw = {
    invoiceId: formData.get("invoiceId"),
  };

  const parsed = initializePaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: parsed.data.invoiceId,
      organizationId: user.organizationId,
      ...(user.role === "RESIDENT" ? { residentId: user.id } : {}),
    },
    include: {
      resident: { select: { id: true, phone: true, email: true, firstName: true, lastName: true } },
      organization: { select: { slug: true } },
    },
  });

  if (!invoice) return fail("Invoice not found");

  if (invoice.status !== "DRAFT" && invoice.status !== "SENT" && invoice.status !== "OVERDUE") {
    return fail(`Cannot initialize payment for invoice in ${invoice.status} status`);
  }

  const secretKey = (process.env.PAYSTACK_SECRET_KEY || "").trim();
  if (!secretKey || secretKey === "test_secret_key_for_local_dev" || secretKey.startsWith("placeholder")) {
    return fail(
      "Paystack secret key is not configured. Please set PAYSTACK_SECRET_KEY=sk_test_... in your .env or .env.local file."
    );
  }

  const cleanPhone = (invoice.resident?.phone || "").replace(/[^0-9]/g, "");
  const payerEmail = invoice.resident?.email || (cleanPhone ? `${cleanPhone}@customer.wastepickup.ng` : "billing@wastepickup.ng");
  const amountInKobo = Math.round(invoice.amount * 100);

  const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
  const orgSlug = invoice.organization?.slug || user.orgSlug;
  const callbackUrl = user.role === "RESIDENT"
    ? `${baseUrl}/${orgSlug}/portal/payments?paid=true`
    : `${baseUrl}/dashboard/admin/invoices?paid=true`;

  let paystackResponse: Response;
  try {
    paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        email: payerEmail,
        amount: amountInKobo,
        currency: "NGN",
        metadata: {
          invoiceId: invoice.id,
          organizationId: user.organizationId,
          residentId: invoice.residentId,
        },
        callback_url: callbackUrl,
      }),
    });
  } catch (networkErr: any) {
    return fail(`Unable to connect to Paystack: ${networkErr?.message || "Network request failed"}`);
  }

  let paystackData: any;
  try {
    paystackData = await paystackResponse.json();
  } catch {
    return fail(`Invalid response from Paystack (HTTP ${paystackResponse.status})`);
  }

  if (!paystackData.status) {
    return fail(paystackData.message || "Failed to initialize payment with Paystack");
  }

  await prisma.payment.create({
    data: {
      organizationId: user.organizationId,
      invoiceId: invoice.id,
      residentId: invoice.residentId,
      provider: "PAYSTACK",
      providerRef: paystackData.data.reference,
      amount: invoice.amount,
      currency: "NGN",
      status: "PENDING",
      metadata: {
        accessCode: paystackData.data.access_code,
        initializedBy: user.id,
        initializedRole: user.role,
      },
    },
  });

  if (invoice.status === "DRAFT") {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "SENT" },
    });
  }

  revalidatePath(`/${orgSlug}/portal/payments`);
  revalidatePath("/dashboard/admin/invoices");

  return ok({ authorizationUrl: paystackData.data.authorization_url });
}

const recordManualPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "POS", "CHEQUE"]),
  reference: z.string().nullish(),
  notes: z.string().nullish(),
});

export async function recordManualPayment(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult<{ invoiceId: string; paymentId: string }>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden: Only administrators can record manual payments");

  const raw = {
    invoiceId: formData.get("invoiceId"),
    paymentMethod: formData.get("paymentMethod"),
    reference: formData.get("reference") || undefined,
    notes: formData.get("notes") || undefined,
  };

  const parsed = recordManualPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: parsed.data.invoiceId,
      organizationId: user.organizationId,
    },
    include: {
      resident: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
  });

  if (!invoice) return fail("Invoice not found");
  if (invoice.status === "PAID") return fail("Invoice is already paid");

  const providerRef =
    parsed.data.reference?.trim() ||
    `MANUAL-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const payment = await prisma.payment.create({
    data: {
      organizationId: user.organizationId,
      invoiceId: invoice.id,
      residentId: invoice.residentId,
      provider: "BANK_TRANSFER",
      providerRef,
      amount: invoice.amount,
      currency: "NGN",
      status: "SUCCESS",
      metadata: {
        paymentMethod: parsed.data.paymentMethod,
        notes: parsed.data.notes || null,
        recordedBy: user.id,
        recordedAt: new Date().toISOString(),
      },
    },
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });

  await prisma.eventLog.create({
    data: {
      organizationId: user.organizationId,
      type: "PAYMENT_RECEIVED",
      payload: {
        invoiceId: invoice.id,
        paymentId: payment.id,
        amount: invoice.amount,
        method: parsed.data.paymentMethod,
        manual: true,
      },
    },
  });

  revalidatePath("/dashboard/admin/invoices");
  revalidatePath("/dashboard/admin");

  return ok({ invoiceId: invoice.id, paymentId: payment.id });
}


