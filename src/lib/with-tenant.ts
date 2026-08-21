import { jwtVerify } from "jose";
import prisma from "@/src/lib/prisma";
import { env } from "@/src/lib/env";

export type OrgVerificationStatus = "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED";

export type SessionUser = {
  id: string;
  role: "ADMIN" | "DRIVER" | "RESIDENT";
  organizationId: string;
  orgSlug: string;
  email: string | null;
  name: string | null;
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
      email: (payload.email as string | null) ?? null,
      name: (payload.name as string | null) ?? null,
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
    select: { id: true, name: true, slug: true, cacNumber: true, verificationStatus: true },
  });
}

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.length > 0 && list.includes(email.toLowerCase());
}

export async function isSuperAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return false;
  return isSuperAdminEmail(user.email);
}

export function normalizeOrgStatus(
  status: string | null | undefined
): OrgVerificationStatus {
  if (status === "VERIFIED" || status === "SUSPENDED") return status;
  return "PENDING_VERIFICATION";
}

export async function getOrgVerificationStatus(orgId: string): Promise<OrgVerificationStatus> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { verificationStatus: true },
  });
  return normalizeOrgStatus(org?.verificationStatus ?? null);
}

export async function requireVerifiedOrg(
  user: SessionUser
): Promise<{ verified: boolean; status: OrgVerificationStatus }> {
  const status = await getOrgVerificationStatus(user.organizationId);
  return { verified: status === "VERIFIED", status };
}
