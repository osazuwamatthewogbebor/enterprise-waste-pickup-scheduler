"use server";

import prisma from "@/src/lib/prisma";

/**
 * Reconciles an inbound direct bank transfer received via Virtual Account webhook
 */
export async function reconcileVirtualAccountTransfer({
  accountNumber,
  amount,
  transactionRef,
}: {
  accountNumber: string;
  amount: number;
  transactionRef: string;
}) {
  // Extract phone suffix from account number (99 + 8 digits)
  const suffix = accountNumber.slice(2);
  const resident = await prisma.user.findFirst({
    where: {
      phone: { endsWith: suffix },
      role: "RESIDENT",
    },
    include: {
      invoices: {
        where: { status: { in: ["SENT", "DRAFT", "OVERDUE"] } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!resident || resident.invoices.length === 0) {
    return { success: false, reason: "No pending invoices found for virtual account" };
  }

  // Settle oldest pending invoice
  const targetInvoice = resident.invoices[0];

  const payment = await prisma.payment.create({
    data: {
      organizationId: resident.organizationId,
      invoiceId: targetInvoice.id,
      residentId: resident.id,
      provider: "BANK_TRANSFER",
      providerRef: transactionRef,
      amount,
      currency: "NGN",
      status: "SUCCESS",
      metadata: {
        channel: "DEDICATED_VIRTUAL_ACCOUNT",
        accountNumber,
      },
    },
  });

  await prisma.invoice.update({
    where: { id: targetInvoice.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });

  await prisma.eventLog.create({
    data: {
      organizationId: resident.organizationId,
      type: "PAYMENT_RECEIVED",
      payload: {
        paymentId: payment.id,
        invoiceId: targetInvoice.id,
        amount,
        channel: "VIRTUAL_NUBAN_TRANSFER",
      },
    },
  });

  return { success: true, paymentId: payment.id, invoiceId: targetInvoice.id };
}
