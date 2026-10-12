"use client";

import { formatWhatsAppBillMessage, generateWhatsAppChatUrl } from "@/src/lib/whatsapp";
import { getResidentVirtualAccount } from "@/src/lib/virtual-accounts";

interface WhatsAppBillButtonProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate?: string | Date | null;
    resident?: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
    } | null;
    organization?: {
      name: string;
      slug: string;
    } | null;
  };
  orgName: string;
  orgSlug: string;
}

export function WhatsAppBillButton({ invoice, orgName, orgSlug }: WhatsAppBillButtonProps) {
  const resident = invoice.resident;
  if (!resident?.phone) return null;

  const residentName = `${resident.firstName ?? ""} ${resident.lastName ?? ""}`.trim() || "Resident";
  const virtualAccount = getResidentVirtualAccount(
    {
      id: resident.id,
      firstName: resident.firstName ?? null,
      lastName: resident.lastName ?? null,
      phone: resident.phone,
    },
    orgName
  );

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://wastepickup.ng";
  const paymentUrl = `${baseUrl}/${orgSlug}/portal/payments`;

  const message = formatWhatsAppBillMessage({
    residentName,
    residentPhone: resident.phone,
    orgName,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.amount,
    dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
    paymentUrl,
    virtualAccount,
  });

  const chatUrl = generateWhatsAppChatUrl(resident.phone, message);

  return (
    <a
      href={chatUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
      title="Send invoice via WhatsApp"
    >
      <span>💬</span>
      <span>WhatsApp</span>
    </a>
  );
}

