"use server";

import prisma from "@/src/lib/prisma";
import { getSessionUser } from "@/src/lib/with-tenant";
import { ok, fail } from "@/src/lib/result";
import type { ActionResult } from "@/src/lib/result";
import { normalizeNigerianPhone, isValidNigerianPhone } from "@/src/lib/phone";
import { z } from "zod";

const residentSchema = z.object({
  phone: z.string().refine((s: string) => isValidNigerianPhone(s), "Invalid Nigerian phone number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  streetAddress: z.string().optional(),
  landmark: z.string().optional(),
  zoneId: z.string().optional(),
});

export async function importResidents(_prevState: unknown, formData: FormData): Promise<ActionResult<any>> {
  const user = await getSessionUser();
  if (!user) return fail("Unauthorized");
  if (user.role !== "ADMIN") return fail("Forbidden");

  const file = formData.get("file") as File;
  if (!file) return fail("No file provided");

  const text = await file.text();
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase());

  const requiredCols = ["phone", "firstName", "lastName"];
  const missing = requiredCols.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    return fail(`Missing required columns: ${missing.join(", ")}`);
  }

  const results = { created: 0, updated: 0, skipped: 0, errors: [] as Array<{ row: number; message: string }> };

  const allZones = await prisma.zone.findMany({
    where: { organizationId: user.organizationId },
    select: { id: true, name: true },
  });

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = cols[idx]?.trim() ?? "";
    });

    const parsed = residentSchema.safeParse(raw);
    if (!parsed.success) {
      const firstIssue = (parsed.error as any).issues?.[0]?.message ?? "Validation error";
      results.errors.push({ row: i + 1, message: firstIssue as string });
      results.skipped++;
      continue;
    }

    const normalized = normalizeNigerianPhone(parsed.data.phone);
    if (!normalized) {
      results.errors.push({ row: i + 1, message: "Invalid phone number" });
      results.skipped++;
      continue;
    }

    let resolvedZoneId: string | null = null;
    if (parsed.data.zoneId) {
      const zone = allZones.find((z) => z.name === parsed.data.zoneId || z.id === parsed.data.zoneId);
      if (zone) resolvedZoneId = zone.id;
    }

    try {
      const existing = await prisma.user.findUnique({
        where: { phone: normalized },
      });

      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            streetAddress: parsed.data.streetAddress ?? null,
            landmark: parsed.data.landmark ?? null,
            zoneId: resolvedZoneId ?? undefined,
            organizationId: user.organizationId,
          },
        });
        results.updated++;
      } else {
        await prisma.user.create({
          data: {
            organizationId: user.organizationId,
            phone: normalized,
            email: `${normalized}@example.com`,
            passwordHash: null,
            role: "RESIDENT",
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            streetAddress: parsed.data.streetAddress ?? null,
            landmark: parsed.data.landmark ?? null,
            zoneId: resolvedZoneId ?? null,
            accountStatus: "CLAIMED",
          },
        });
        results.created++;
      }
    } catch {
      results.errors.push({ row: i + 1, message: "Database error" });
    }
  }

  return ok(results);
}
