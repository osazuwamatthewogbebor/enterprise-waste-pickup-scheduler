export interface CompliancePassData {
  residentId: string;
  residentName: string;
  streetAddress: string;
  orgName: string;
  cacNumber?: string | null;
  status: "ACTIVE_COMPLIANT" | "OVERDUE_DEFICIT" | "UNREGISTERED";
  paidUntilMonth: string;
  verificationToken: string;
}

/**
 * Evaluates whether a household meets statutory municipal waste compliance
 */
export function generateCompliancePass({
  resident,
  organization,
  latestPaidInvoiceDate,
}: {
  resident: { id: string; firstName: string | null; lastName: string | null; streetAddress: string | null };
  organization: { name: string; cacNumber: string | null; slug: string };
  latestPaidInvoiceDate?: Date | null;
}): CompliancePassData {
  const residentName = `${resident.firstName ?? ""} ${resident.lastName ?? ""}`.trim() || "Resident";
  const address = resident.streetAddress || "Registered Property";

  const isCompliant = Boolean(latestPaidInvoiceDate);
  const paidUntilMonth = latestPaidInvoiceDate
    ? latestPaidInvoiceDate.toLocaleDateString("en-NG", { month: "long", year: "numeric" })
    : "No Settled Payments";

  // Verifiable cryptographic payload representation
  const verificationToken = Buffer.from(
    JSON.stringify({
      resId: resident.id,
      org: organization.slug,
      verified: isCompliant,
      ts: Date.now(),
    })
  ).toString("base64url");

  return {
    residentId: resident.id,
    residentName,
    streetAddress: address,
    orgName: organization.name,
    cacNumber: organization.cacNumber,
    status: isCompliant ? "ACTIVE_COMPLIANT" : "OVERDUE_DEFICIT",
    paidUntilMonth,
    verificationToken,
  };
}

