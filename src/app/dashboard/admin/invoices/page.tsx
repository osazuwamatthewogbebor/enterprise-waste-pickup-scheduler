import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import { listInvoices } from "@/src/lib/actions/v1/invoices";
import { listResidents } from "@/src/lib/actions/v1/residents";
import { InvoiceDialog } from "@/src/components/admin/invoice-form";
import { RecordPaymentDialog } from "@/src/components/admin/record-payment-dialog";
import { WhatsAppBillButton } from "@/src/components/admin/whatsapp-bill-button";

export default async function AdminInvoicesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const invResult = await listInvoices();
  const resResult = await listResidents();
  const invoices = invResult.success ? invResult.data! : [];
  const residents = resResult.success ? resResult.data! : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
          <p className="mt-1 text-sm text-slate-600">Manage billing and track payments</p>
        </div>
        <InvoiceDialog residents={residents} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Resident</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No invoices found. Create your first invoice to get started.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-200">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {(() => {
                        const name = `${inv.resident?.firstName ?? ""} ${inv.resident?.lastName ?? ""}`.trim();
                        return name || "—";
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-900">
                      ₦{Number(inv.amount).toLocaleString("en-NG")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          inv.status === "DRAFT"
                            ? "bg-slate-100 text-slate-700"
                            : inv.status === "SENT"
                            ? "bg-blue-100 text-blue-700"
                            : inv.status === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : inv.status === "OVERDUE"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-NG") : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <WhatsAppBillButton
                          invoice={inv}
                          orgName={user.name || "Waste Services"}
                          orgSlug={user.orgSlug}
                        />
                        {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                          <RecordPaymentDialog invoice={inv} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
