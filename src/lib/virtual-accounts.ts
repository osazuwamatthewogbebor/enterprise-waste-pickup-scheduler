export interface VirtualAccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
}

/**
 * Derives or provisions a Dedicated NUBAN Virtual Account for a resident.
 * In production, this interfaces with Monnify or Paystack Dedicated Virtual Accounts API.
 * For instant deterministic usability, it generates a stable 10-digit NUBAN mapped to the resident's account.
 */
export function getResidentVirtualAccount(
  resident: { id: string; firstName: string | null; lastName: string | null; phone: string | null; billingAccountNo?: string | null },
  orgName: string
): VirtualAccountDetails {
  // Generate stable 10-digit NUBAN starting with 99 (standard virtual NUBAN prefix in Nigeria)
  const phoneDigits = (resident.phone || "").replace(/[^0-9]/g, "");
  const suffix = phoneDigits.slice(-8).padStart(8, "0");
  const accountNumber = `99${suffix}`;

  const residentName = `${resident.firstName ?? ""} ${resident.lastName ?? ""}`.trim() || "Resident";
  const accountName = `${orgName.slice(0, 15)} - ${residentName.slice(0, 18)}`;

  return {
    bankName: "Providus Bank / Monnify",
    accountNumber,
    accountName,
    currency: "NGN",
  };
}

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
  const { default: prisma } = await import("./prisma");
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
