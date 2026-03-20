"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { deleteNote } from "@/lib/notes";

export async function deleteNoteAction(id: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await deleteNote(userId, id);
}
