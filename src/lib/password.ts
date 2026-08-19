import crypto from "crypto";

export function generateTempPassword(length = 12): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}
