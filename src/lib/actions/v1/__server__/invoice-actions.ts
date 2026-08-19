"use server";

import prisma from "@/src/lib/prisma";
import { getSessionUser, requireVerifiedOrg } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";
import { z } from "zod";
import type { Invoice } from "@/src/generated/prisma/client";

const createInvoiceSchema = z.object({
  residentId: z.string(),
  amount: z.coerce.number().min(1),
  dueDate: z.string().optional(),
});

const initializePaymentSchema = z.object({
  invoiceId: z.string(),
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

  return ok(invoice);
}

export async function initializePayment(_prevState: unknown, formData: FormData): Promise<ActionResult<{ authorizationUrl: string }>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const verified = await requireVerifiedOrg(user);
  if (!verified.verified) {
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
    where: { id: parsed.data.invoiceId, organizationId: user.organizationId },
    include: { resident: { select: { phone: true, firstName: true, lastName: true } } },
  });

  if (!invoice) return fail("Invoice not found");

  if (invoice.status !== "DRAFT" && invoice.status !== "SENT") {
    return fail(`Cannot initialize payment for invoice in ${invoice.status} status`);
  }

  const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
    body: JSON.stringify({
      email: invoice.resident?.phone || "no-email@user.com",
      amount: invoice.amount,
      currency: "NGN",
      metadata: {
        invoiceId: invoice.id,
        organizationId: user.organizationId,
      },
      callback_url: `${process.env.AUTH_URL}/api/webhooks/paystack`,
    }),
  });

  const paystackData = await paystackResponse.json();

  if (!paystackData.status) {
    return fail(paystackData.message || "Failed to initialize payment");
  }

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status: "SENT" },
  });

  await prisma.eventLog.create({
    data: {
      organizationId: user.organizationId,
      type: "PAYMENT_RECEIVED",
      payload: { invoiceId: invoice.id, amount: invoice.amount },
    },
  });

  return ok({ authorizationUrl: paystackData.data.authorization_url });
}
