import "server-only";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucket = process.env.SUPABASE_RECEIPTS_BUCKET || "receipts";

// Service-role client: only ever used server-side. Never expose this key to
// the browser — it bypasses row-level security on the storage bucket.
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 72;

export type UploadedReceipt = {
  storagePath: string;
  mimeType: string;
  size: number;
};

/**
 * Resizes/compresses a receipt image and uploads it to the private Supabase
 * bucket, scoped under the owning user's id so users can never collide or
 * enumerate each other's files.
 */
export async function uploadReceiptImage(
  userId: string,
  file: Buffer,
): Promise<UploadedReceipt> {
  const optimized = await sharp(file)
    .rotate() // respect EXIF orientation
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  const storagePath = `${userId}/${randomUUID()}.jpg`;

  const { error } = await supabaseAdmin.storage.from(bucket).upload(storagePath, optimized, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (error) throw new Error(`Failed to upload receipt: ${error.message}`);

  return { storagePath, mimeType: "image/jpeg", size: optimized.byteLength };
}

/** Returns a short-lived signed URL so receipts stay private by default. */
export async function getReceiptSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60 * 10); // 10 minutes

  if (error || !data) throw new Error(`Failed to sign receipt URL: ${error?.message}`);
  return data.signedUrl;
}

export async function deleteReceiptImage(storagePath: string): Promise<void> {
  await supabaseAdmin.storage.from(bucket).remove([storagePath]);
}
