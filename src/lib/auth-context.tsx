"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  email: string | null;
  displayName: string;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getSupabaseBrowser();
    let mounted = true;

    client.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = getSupabaseBrowser();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setSession(data.session);
    setUser(data.user);
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    const client = getSupabaseBrowser();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || email.split("@")[0] } },
    });
    if (error) return { error: error.message };
    setSession(data.session);
    setUser(data.user);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabaseBrowser();
    await client.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split("@")[0] ||
    "Admin User";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        email: user?.email ?? null,
        displayName,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
