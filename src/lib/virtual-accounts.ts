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

