import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import NoteForm from "@/components/NoteForm";
import { createNoteAction } from "./actions";

export default async function NewNotePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <>
      <Navbar />
      <NoteForm action={createNoteAction} mode="create" />
    </>
  );
}
