import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";
import { ResidentPortalShell } from "@/src/components/resident/resident-portal-shell";

export default async function ResidentPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const user = await getSessionUser();

  if (!user || user.role !== "RESIDENT" || user.orgSlug !== slug) {
    redirect(`/${slug}/login`);
  }

  return (
    <ResidentPortalShell
      slug={slug}
      user={{ name: user.name, email: user.email }}
    >
      {children}
    </ResidentPortalShell>
  );
}
