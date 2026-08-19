import { redirect } from "next/navigation";

export default async function DriverHome() {
  redirect("/dashboard/driver/routes");
}
