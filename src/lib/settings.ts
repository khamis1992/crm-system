import { supabase } from "@/lib/supabase";

export function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const s = localStorage.getItem(key);
    if (s) return JSON.parse(s) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function saveLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export async function getSetting<T = Record<string, unknown>>(key: string, fallback: T): Promise<T> {
  const local = loadLocal<T | null>(`crm-setting-${key}`, null);
  try {
    const { data, error } = await supabase.from("org_settings").select("value").eq("key", key).maybeSingle();
    if (!error && data?.value && typeof data.value === "object") {
      return data.value as T;
    }
  } catch {
    /* table may not exist yet */
  }
  if (local != null) return local;
  return fallback;
}

export async function saveSetting(key: string, value: unknown): Promise<{ error: string | null }> {
  saveLocal(`crm-setting-${key}`, value);
  try {
    const { data: existing, error: readErr } = await supabase
      .from("org_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle();
    if (readErr) {
      // Table missing — localStorage only is fine for now
      return { error: null };
    }
    if (existing?.id) {
      const { error } = await supabase
        .from("org_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
      return { error: error?.message ?? null };
    }
    const { error } = await supabase.from("org_settings").insert({ key, value });
    return { error: error?.message ?? null };
  } catch {
    return { error: null };
  }
}
