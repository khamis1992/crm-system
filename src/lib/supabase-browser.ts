"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type AnyClient = SupabaseClient<any, any, any>;

let client: AnyClient | null = null;

/** Single browser Supabase client (cookie session + zcrm schema) */
export function getSupabaseBrowser(): AnyClient {
  if (client) return client;
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "zcrm" } }
  ) as AnyClient;
  return client;
}
