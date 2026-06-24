import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "product-images";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function uploadProductImage(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, ONE_YEAR);
  if (signErr || !data?.signedUrl) throw signErr ?? new Error("No signed URL");
  return data.signedUrl;
}
