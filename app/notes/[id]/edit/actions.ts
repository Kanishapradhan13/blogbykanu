"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

  redirect(`/notes/${id}`);
}
