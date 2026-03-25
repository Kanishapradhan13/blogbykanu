"use server";

import { auth } from "@clerk/nextjs/server";
import { getPublicSupabase } from "@/lib/supabase";

export async function uploadImageAction(formData: FormData): Promise<{ url: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("No file provided");

  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const buffer = new Uint8Array(await file.arrayBuffer());
  const supabase = getPublicSupabase();

  const { error } = await supabase.storage
    .from("note-images")
    .upload(fileName, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from("note-images")
    .getPublicUrl(fileName);

  return { url: publicUrl };
}
