import { getSupabase } from "./supabase";

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  excerpt: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateNoteInput = {
  title: string;
  content: string;
  category: string;
  tags: string[];
};

export type UpdateNoteInput = Partial<CreateNoteInput>;

function generateExcerpt(content: string, maxLength = 160): string {
  const stripped = content
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();

  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

export async function getNotes(userId: string): Promise<Note[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch notes: ${error.message}`);
  return data ?? [];
}

export async function getNoteById(userId: string, id: string): Promise<Note | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch note: ${error.message}`);
  }
  return data;
}

export async function createNote(userId: string, input: CreateNoteInput): Promise<Note> {
  const supabase = getSupabase();
  const excerpt = generateExcerpt(input.content);

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      title: input.title,
      content: input.content,
      category: input.category,
      tags: input.tags,
      excerpt,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create note: ${error.message}`);
  return data;
}

export async function updateNote(
  userId: string,
  id: string,
  input: UpdateNoteInput
): Promise<Note> {
  const supabase = getSupabase();
  const updateData: Record<string, unknown> = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  if (input.content) {
    updateData.excerpt = generateExcerpt(input.content);
  }

  const { data, error } = await supabase
    .from("notes")
    .update(updateData)
    .eq("user_id", userId)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update note: ${error.message}`);
  return data;
}

export async function deleteNote(userId: string, id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);

  if (error) throw new Error(`Failed to delete note: ${error.message}`);
}

export function getWordCount(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function getReadTime(content: string): number {
  const words = getWordCount(content);
  return Math.max(1, Math.ceil(words / 200));
}

export const CATEGORIES = [
  "General",
  "Recon",
  "Web Exploitation",
  "Privilege Escalation",
  "Forensics",
  "OSINT",
  "CTF Writeup",
  "Tools",
] as const;

export type Category = (typeof CATEGORIES)[number];
