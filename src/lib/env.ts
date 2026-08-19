import { z } from "zod";

const asOptionalUrl = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.string().url().optional(),
);

const asOptionalString = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.string().optional(),
);

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: asOptionalUrl,
  GOOGLE_CLIENT_ID: asOptionalString,
  GOOGLE_CLIENT_SECRET: asOptionalString,
  PAYSTACK_SECRET_KEY: asOptionalString,
  PAYSTACK_PUBLIC_KEY: asOptionalString,
  NEXT_PUBLIC_MAPBOX_TOKEN: asOptionalString,
  BLOB_READ_WRITE_TOKEN: asOptionalString,
  SUPER_ADMIN_EMAILS: asOptionalString,
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);
