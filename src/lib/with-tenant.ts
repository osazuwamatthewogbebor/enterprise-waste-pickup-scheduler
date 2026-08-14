import { jwtVerify } from "jose";
import prisma from "@/src/lib/prisma";
import { env } from "@/src/lib/env";

export type SessionUser = {
  id: string;
  role: "ADMIN" | "DRIVER" | "RESIDENT";
  organizationId: string;
  orgSlug: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  if (typeof window !== "undefined") return null;

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(env.AUTH_SECRET)
    );
    return {
      id: payload.sub as string,
      role: payload.role as SessionUser["role"],
      organizationId: payload.organizationId as string,
      orgSlug: payload.orgSlug as string,
    };
  } catch {
    return null;
  }
}

export async function requireRole(
  allowed: SessionUser["role"][]
): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (!allowed.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
}
