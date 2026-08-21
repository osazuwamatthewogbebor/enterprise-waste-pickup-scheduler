import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/lib/with-tenant";

export default async function ResidentHome() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "RESIDENT") redirect("/dashboard");

  redirect(`/${user.orgSlug}/portal`);
}
