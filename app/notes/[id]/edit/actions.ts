"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateNote } from "@/lib/notes";

export async function updateNoteAction(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const tagsRaw = formData.get("tags") as string;

  if (!title?.trim() || !content?.trim()) {
    throw new Error("Title and content are required.");
  }

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    : [];

  await updateNote(userId, id, {
    title: title.trim(),
    content: content.trim(),
    category: category || "General",
    tags,
  });

  revalidatePath("/public");
  redirect(`/notes/${id}`);
}

export async function autoSaveNoteAction(
  id: string,
  data: { title: string; content: string; category: string; tags: string }
): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const tags = data.tags
    ? data.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];

  try {
    await updateNote(userId, id, {
      title: data.title.trim() || "Untitled",
      content: data.content.trim(),
      category: data.category || "General",
      tags,
    });
    revalidatePath("/public");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}
