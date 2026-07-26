"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const TEST_ADMIN = {
  email: "admin@crm.local",
  password: "Admin123!",
  name: "Admin User",
};

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(TEST_ADMIN.email);
  const [password, setPassword] = useState(TEST_ADMIN.password);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function doLogin(loginEmail: string, loginPassword: string) {
    setError("");
    setSubmitting(true);
    try {
      const { error: err } = await signIn(loginEmail, loginPassword);
      if (err) {
        setError(err);
        setSubmitting(false);
        return;
      }
      // Full navigation so middleware picks up auth cookies
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
      setSubmitting(false);
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await doLogin(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--crm-bg)] px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--crm-border)] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded bg-[var(--crm-blue)] text-sm font-bold text-white">
            Z
          </div>
          <h1 className="text-lg font-semibold text-[var(--crm-text)]">Sign in to CRM</h1>
          <p className="mt-1 text-xs text-gray-500">Zoho-style CRM powered by Supabase</p>
        </div>

        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--crm-blue)]">
            Test admin account
          </div>
          <div className="space-y-0.5 text-xs text-gray-700">
            <div>
              <span className="text-gray-500">Email:</span> {TEST_ADMIN.email}
            </div>
            <div>
              <span className="text-gray-500">Password:</span> {TEST_ADMIN.password}
            </div>
            <div>
              <span className="text-gray-500">Name:</span> {TEST_ADMIN.name}
            </div>
          </div>
          <button
            type="button"
            className="crm-btn crm-btn-primary mt-3 w-full justify-center !text-xs"
            disabled={submitting}
            onClick={() => {
              setEmail(TEST_ADMIN.email);
              setPassword(TEST_ADMIN.password);
              void doLogin(TEST_ADMIN.email, TEST_ADMIN.password);
            }}
          >
            {submitting ? "Signing in..." : "Login as Admin (one click)"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" method="post" action="#">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="crm-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              className="crm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="crm-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="crm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="crm-btn crm-btn-primary w-full justify-center"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-[var(--crm-blue)] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
