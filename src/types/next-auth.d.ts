import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "DRIVER" | "RESIDENT";
      organizationId: string;
      orgSlug: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "DRIVER" | "RESIDENT";
    organizationId: string;
    orgSlug: string;
  }
}
