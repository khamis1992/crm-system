"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signUp(email, password, name);
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--crm-bg)] px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--crm-border)] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded bg-[var(--crm-blue)] text-sm font-bold text-white">
            Z
          </div>
          <h1 className="text-lg font-semibold text-[var(--crm-text)]">Create your account</h1>
          <p className="mt-1 text-xs text-[var(--crm-muted)]">Get started with CRM</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="crm-label">Full name</label>
            <input
              id="name"
              type="text"
              className="crm-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="email" className="crm-label">Email</label>
            <input
              id="email"
              type="email"
              className="crm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="crm-label">Password</label>
            <input
              id="password"
              type="password"
              className="crm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="crm-btn crm-btn-primary w-full justify-center"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[var(--crm-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--crm-blue)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
