import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import { getRouteDetail } from "@/src/lib/actions/v1/routes";
import { DriverRouteDetail } from "@/src/components/driver/driver-route-detail";

export default async function DriverRouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "DRIVER") redirect("/dashboard");

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

  return <DriverRouteDetail route={route} stops={stops} />;
}
