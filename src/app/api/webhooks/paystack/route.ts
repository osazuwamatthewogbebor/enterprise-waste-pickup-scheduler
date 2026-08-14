import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import prisma from "@/src/lib/prisma";
import { env } from "@/src/lib/env";

async function verifyPaystackSignature(body: string, signature: string) {
  const hash = crypto
    .createHmac("sha512", env.PAYSTACK_SECRET_KEY || "")
    .update(body)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("x-paystack-signature") ?? "";

  if (!env.PAYSTACK_SECRET_KEY || !(await verifyPaystackSignature(body, signature))) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const payment = await prisma.payment.findFirst({
      where: { providerRef: event.data.reference },
      include: { invoice: true },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" },
      });

      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "PAID", paidAt: new Date() },
      });

      await prisma.eventLog.create({
        data: {
          organizationId: payment.organizationId,
          type: "PAYMENT_RECEIVED",
          payload: { paymentId: payment.id, invoiceId: payment.invoiceId, amount: payment.amount },
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}
