import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import { listServiceRequests } from "@/src/lib/actions/v1/service-requests";
import { transitionServiceRequest } from "@/src/lib/actions/v1/__server__/service-request-actions";
import { ServiceRequestTable } from "@/src/components/admin/service-request-table";

export default async function AdminServiceRequestsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const result = await listServiceRequests();
  const requests = result.success ? result.data! : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Service Requests</h1>
        <p className="mt-1 text-sm text-slate-600">Review and manage public service requests</p>
      </div>

      <ServiceRequestTable requests={requests} transitionAction={transitionServiceRequest} />
    </div>
  );
}
