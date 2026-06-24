import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/integrations/supabase/types";

function readSupabaseEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured.");
  }

  return { url, key };
}

export function createClient() {
  const { url, key } = readSupabaseEnv();
  return createBrowserClient<Database>(url, key);
}
