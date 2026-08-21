import { ResidentRequestsTable } from "@/src/components/resident/ResidentRequestsTable";
import { listResidentServiceRequests } from "@/src/lib/actions/v1/service-requests";

export default async function ResidentPortalRequestsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await listResidentServiceRequests();
  const requests = result.success
    ? (result.data as unknown as ResidentServiceRequest[])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My service requests</h1>
          <p className="mt-1 text-sm text-slate-600">Requests you have submitted for pickup collection.</p>
        </div>
        <a
          href={`/${slug}/portal/new`}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Create New Request
        </a>
      </div>

      <ResidentRequestsTable requests={requests} slug={slug} />
    </div>
  );
}

interface ResidentServiceRequest {
  id: string;
  type: string;
  status: string;
  address: string;
  createdAt: string;
}
