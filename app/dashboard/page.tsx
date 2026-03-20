import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getNotes } from "@/lib/notes";
import Navbar from "@/components/Navbar";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [notes, user] = await Promise.all([
    getNotes(userId),
    currentUser(),
  ]);

  const username =
    user?.username ??
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "operator";

  return (
    <>
      <Navbar />
      <DashboardClient notes={notes} username={username} />
    </>
  );
}
