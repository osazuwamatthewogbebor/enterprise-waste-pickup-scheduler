import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import { getRouteDetail } from "@/src/lib/actions/v1/routes";
import { RouteDetail } from "@/src/components/admin/route-detail";

export default async function AdminRouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const result = await getRouteDetail(id);

  if (!result.success) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">{result.error}</p>
      </div>
    );
  }

  const { route, stops } = result.data!;

  return <RouteDetail route={route} stops={stops} />;
}
