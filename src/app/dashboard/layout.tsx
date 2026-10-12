import { redirect } from "next/navigation";
import { getSessionUser, requireVerifiedOrg, isSuperAdmin } from "@/src/lib/with-tenant";
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

  const verified = await requireVerifiedOrg(user);
  const superAdmin = await isSuperAdmin();

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email || user.phone || `${user.orgSlug} admin`,
        role: user.role,
        orgSlug: user.orgSlug,
      }}
      orgStatus={verified.status}
      isSuperAdmin={superAdmin}
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
