import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import prisma from "@/src/lib/prisma";
import { listResidentInvoices } from "@/src/lib/actions/v1/invoices";
import { ResidentPayButton } from "@/src/components/resident/resident-pay-button";
import { getResidentVirtualAccount } from "@/src/lib/virtual-accounts";
import { generateCompliancePass } from "@/src/lib/compliance";
import { CopyAccountButton } from "@/src/components/resident/copy-account-button";

export default async function ResidentPortalPaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ paid?: string; ref?: string }>;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "RESIDENT") redirect("/login");

  const { slug } = await params;
  if (user.orgSlug !== slug) redirect(`/${slug}/login`);

  const { paid } = await searchParams;

  const resident = await prisma.user.findUnique({
    where: { id: user.id },
    include: { organization: true },
  });

  if (!resident || !resident.organization) {
    redirect(`/${slug}/login`);
  }

  const result = await listResidentInvoices();
  const invoices = result.success ? (result.data ?? []) : [];

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== "PAID" && inv.status !== "CANCELLED")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const latestPaid = invoices.find((i) => i.status === "PAID");
  const virtualAccount = getResidentVirtualAccount(resident, resident.organization.name);
  const compliance = generateCompliancePass({
    resident,
    organization: resident.organization,
    latestPaidInvoiceDate: latestPaid?.paidAt ?? (latestPaid ? new Date(latestPaid.createdAt) : null),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Billing & Payments</h1>
        <p className="mt-1 text-sm text-slate-600">
          Settle your waste collection bills via instant Bank Transfer, Debit Card, or USSD.
        </p>
      </div>

      {paid && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-3">
          <span className="text-xl font-bold">✓</span>
          <div>
            <p className="text-sm font-semibold">Payment Received & Under Verification</p>
            <p className="text-xs text-emerald-700">Your waste provider will update your balance momentarily.</p>
          </div>
        </div>
      )}

      {/* Top Section: Dedicated Virtual Account & Compliance Pass */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dedicated NUBAN Virtual Account */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Dedicated Virtual Bank Account
              </span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Instant Auto-Clearance
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              Transfer directly from any Nigerian banking app (OPay, GTBank, Kuda, PalmPay) to instantly credit your account:
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Bank Name</span>
                <span className="text-sm font-semibold text-slate-900">{virtualAccount.bankName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                    {virtualAccount.accountNumber}
                  </span>
                  <CopyAccountButton accountNumber={virtualAccount.accountNumber} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Account Name</span>
                <span className="text-xs font-medium text-slate-700 truncate max-w-[220px]" title={virtualAccount.accountName}>
                  {virtualAccount.accountName}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Direct NUBAN Settlement</span>
            <span className="text-emerald-600 font-medium">Automatic Matching</span>
          </div>
        </div>

        {/* Regulatory Municipal Compliance Pass */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Municipal Environmental Pass
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  compliance.status === "ACTIVE_COMPLIANT"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {compliance.status === "ACTIVE_COMPLIANT" ? "LAWMA / PSP Verified" : "Payment Required"}
              </span>
            </div>

            <h3 className="mt-3 text-lg font-bold text-slate-900">{compliance.residentName}</h3>
            <p className="text-xs text-slate-500">{compliance.streetAddress}</p>

            <div className="mt-4 border-t border-slate-100 pt-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized Operator:</span>
                <span className="font-medium text-slate-800">{compliance.orgName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settled Through:</span>
                <span className="font-semibold text-slate-900">{compliance.paidUntilMonth}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Pass ID: #{compliance.residentId.slice(-6).toUpperCase()}</span>
            <span className="text-emerald-600 font-medium">Official Digital Verification</span>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Outstanding Balance
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₦{totalOutstanding.toLocaleString("en-NG")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {totalOutstanding > 0 ? "Pending payment" : "All accounts up to date"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Paid (History)
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            ₦{totalPaid.toLocaleString("en-NG")}
          </p>
          <p className="mt-1 text-xs text-slate-500">Lifetime waste collections settled</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Collection Invoices & Statements</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-500">No invoices have been issued yet for your address.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Online Checkout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-NG") : "Upon Receipt"}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      ₦{Number(inv.amount).toLocaleString("en-NG")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          inv.status === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : inv.status === "OVERDUE"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status !== "PAID" && inv.status !== "CANCELLED" ? (
                        <ResidentPayButton invoiceId={inv.id} amount={inv.amount} />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Receipt Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
