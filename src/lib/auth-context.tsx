"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabaseAuth } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

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
    supabaseAuth.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabaseAuth.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    const { error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || email.split("@")[0] } },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabaseAuth.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split("@")[0] ||
    "Demo User";

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
