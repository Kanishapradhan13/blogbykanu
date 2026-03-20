import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getNoteById } from "@/lib/notes";
import Navbar from "@/components/Navbar";
import NoteForm from "@/components/NoteForm";
import { updateNoteAction } from "./actions";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const note = await getNoteById(userId, id);
  if (!note) redirect("/dashboard");

  // Bind note ID to the action
  const boundAction = updateNoteAction.bind(null, id);

  return (
    <>
      <Navbar />
      <NoteForm action={boundAction} mode="edit" note={note} />
    </>
  );
}
