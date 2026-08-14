import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import { DashboardShell } from "@/src/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      user={{
        name: null,
        email: null,
        role: user.role,
        orgSlug: user.orgSlug,
      }}
    >
      {children}
    </DashboardShell>
  );
}

export async function generateMetadata() {
  return {
    title: "WastePickup Dashboard",
  };
}
