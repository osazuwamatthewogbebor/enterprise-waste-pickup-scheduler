export const features = {
  paystackPayments: process.env.NODE_ENV === "production" || process.env.PAYSTACK_SECRET_KEY !== undefined,
  mapbox: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  blobUploads: !!process.env.BLOB_READ_WRITE_TOKEN,
  csvImport: true,
  googleOAuth: !!process.env.GOOGLE_CLIENT_ID,
};
