import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  target_per_week: number;
  created_at: string;
};

export type Completion = {
  id: string;
  habit_id: string;
  completed_on: string;
};

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder"));
}
