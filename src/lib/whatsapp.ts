export interface WhatsAppInvoicePayload {
  residentName: string;
  residentPhone: string;
  orgName: string;
  invoiceNumber: string;
  amount: number;
  dueDate?: Date | null;
  paymentUrl: string;
  virtualAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

/**
 * Formats a clean, high-conversion Nigerian WhatsApp billing statement.
 */
export function formatWhatsAppBillMessage(data: WhatsAppInvoicePayload): string {
  const formattedAmount = `₦${Number(data.amount).toLocaleString("en-NG")}`;
  const due = data.dueDate ? new Date(data.dueDate).toLocaleDateString("en-NG") : "Immediate";

  let msg = `*${data.orgName} - Waste Collection Notice* 🚛\n\n`;
  msg += `Dear *${data.residentName}*,\n`;
  msg += `Your monthly municipal waste management invoice is ready.\n\n`;
  msg += `📄 *Invoice Number:* ${data.invoiceNumber}\n`;
  msg += `💰 *Amount Due:* ${formattedAmount}\n`;
  msg += `📅 *Due Date:* ${due}\n\n`;

  if (data.virtualAccount) {
    msg += `🏦 *PAY VIA DIRECT BANK TRANSFER (Instant Automatic Clearance):*\n`;
    msg += `• *Bank:* ${data.virtualAccount.bankName}\n`;
    msg += `• *Account Number:* \`${data.virtualAccount.accountNumber}\` (Tap to copy)\n`;
    msg += `• *Account Name:* ${data.virtualAccount.accountName}\n\n`;
  }

  msg += `💳 *PAY ONLINE VIA CARD / USSD:*\n`;
  msg += `${data.paymentUrl}\n\n`;
  msg += `_Thank you for keeping our community clean and compliant with state environmental standards._`;

  return msg;
}

/**
 * Formats a real-time compactor truck arrival notification
 */
export function formatWhatsAppArrivalAlert({
  residentName,
  orgName,
  truckName,
  etaMinutes,
}: {
  residentName: string;
  orgName: string;
  truckName: string;
  etaMinutes: number;
}): string {
  let msg = `🚛 *${orgName} - Waste Compactor Arrival Alert*\n\n`;
  msg += `Hello *${residentName}*,\n`;
  msg += `Our collection compactor (*${truckName}*) is currently servicing your street and will arrive in approximately *${etaMinutes} minutes*.\n\n`;
  msg += `👉 Please ensure your bins and bagged waste are placed outside your gate for smooth collection.\n`;
  msg += `_WastePickup Real-Time Dispatch System_`;
  return msg;
}

/**
 * Generates an instant Click-to-Chat WhatsApp URL for one-click operator dispatch
 */
export function generateWhatsAppChatUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Dispatches via Meta WhatsApp Cloud API if configured in environment
 */
export async function sendWhatsAppCloudMessage(phone: string, text: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    // Graceful fallback when cloud credentials are not yet provisioned
    return { success: false, error: "WhatsApp Cloud API credentials not configured; use Click-to-Chat URL" };
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { preview_url: true, body: text },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data?.error?.message || "WhatsApp delivery failed" };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Network error dispatching WhatsApp" };
  }
}

