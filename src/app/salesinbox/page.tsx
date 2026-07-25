"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { Plus, Mail } from "lucide-react";

type Thread = {
  id: string;
  subject: string;
  from_email: string | null;
  to_email: string | null;
  preview: string | null;
  folder: string | null;
  is_read: boolean | null;
  created_at: string;
};

export default function SalesInboxPage() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<Thread | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState({ to_email: "", subject: "", preview: "" });

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("email_threads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast(error.message, "error");
    setThreads((data as Thread[]) || []);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(t: Thread) {
    setSelected(t);
    if (!t.is_read) {
      await supabase.from("email_threads").update({ is_read: true }).eq("id", t.id);
      load();
    }
  }

  async function compose() {
    if (!form.subject.trim()) return toast("Subject required", "error");
    const { error } = await supabase.from("email_threads").insert({
      subject: form.subject,
      from_email: "me@crm.local",
      to_email: form.to_email,
      preview: form.preview,
      folder: "Sent",
      is_read: true,
    });
    if (error) return toast(error.message, "error");
    await supabase.from("activities").insert({
      activity_type: "email",
      subject: form.subject,
      body: `To: ${form.to_email}\n\n${form.preview}`,
      related_to_type: "email",
    });
    toast("Message saved to SalesInbox", "success");
    setComposeOpen(false);
    setForm({ to_email: "", subject: "", preview: "" });
    load();
  }

  return (
    <div className="flex h-full">
      <div className="flex w-full max-w-md flex-col border-r border-[var(--crm-border)] bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h1 className="text-lg font-semibold">SalesInbox</h1>
          <button className="crm-btn crm-btn-primary !text-xs" onClick={() => setComposeOpen(true)}>
            <Plus size={12} /> Compose
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {threads.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              No messages yet. Compose one or seed via migration.
            </div>
          )}
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => markRead(t)}
              className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-blue-50/40 ${
                selected?.id === t.id ? "bg-blue-50" : ""
              } ${!t.is_read ? "bg-indigo-50/30" : ""}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {(t.from_email || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <span className={`truncate text-sm ${!t.is_read ? "font-semibold" : "font-medium"}`}>
                    {t.from_email || t.to_email}
                  </span>
                  <span className="shrink-0 text-[11px] text-gray-400">{formatDate(t.created_at)}</span>
                </div>
                <div className="truncate text-sm text-[var(--crm-blue)]">{t.subject}</div>
                <div className="truncate text-xs text-gray-500">{t.preview}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-[var(--crm-bg)] p-6">
        {selected ? (
          <div className="rounded border border-[var(--crm-border)] bg-white p-6">
            <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
              <Mail size={12} /> {selected.folder || "Inbox"}
            </div>
            <h2 className="text-xl font-semibold">{selected.subject}</h2>
            <div className="mt-2 text-sm text-gray-500">
              From: {selected.from_email || "—"} · To: {selected.to_email || "—"}
            </div>
            <div className="mt-6 whitespace-pre-wrap text-sm text-gray-700">{selected.preview}</div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Select a message to read
          </div>
        )}
      </div>

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Compose"
        width="lg"
        footer={
          <>
            <button className="crm-btn crm-btn-secondary" onClick={() => setComposeOpen(false)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" onClick={compose}>Send</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="crm-label">To</label>
            <input className="crm-input" value={form.to_email} onChange={(e) => setForm({ ...form, to_email: e.target.value })} />
          </div>
          <div>
            <label className="crm-label">Subject</label>
            <input className="crm-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div>
            <label className="crm-label">Message</label>
            <textarea className="crm-input min-h-[140px]" value={form.preview} onChange={(e) => setForm({ ...form, preview: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
