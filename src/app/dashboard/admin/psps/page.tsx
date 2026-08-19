import { redirect } from "next/navigation";
import { getSessionUser, isSuperAdmin } from "@/src/lib/with-tenant";
import { listOrganizations } from "@/src/lib/actions/v1/__server__/organization-actions";
import { PspTable } from "@/src/components/admin/psp-table";

interface Org {
  id: string;
  name: string;
  slug: string;
  cacNumber: string | null;
  verificationStatus: string;
  residentCount: number;
  createdAt: Date;
}

export default async function PspAdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const superAdmin = await isSuperAdmin();
  if (!superAdmin) redirect("/dashboard");

  const result = await listOrganizations();
  const orgs: Org[] = result.success ? (result.data as Org[]) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Organizations (PSPs)</h1>
        <p className="mt-1 text-sm text-slate-600">
          Verify and manage platform partner organizations. Toggle an organization to VERIFIED to unlock live route
          dispatches, Paystack billing, and service request processing.
        </p>
      </div>

      <PspTable orgs={orgs} />
    </div>
  );
}
