"use client";

import { useEffect, useState } from "react";
import { supabase, type Activity } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";

export default function FeedsPage() {
  const { displayName } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Activity[]>([]);
  const [body, setBody] = useState("");

  async function load() {
    const { data } = await supabase.from("activities").select("*").order("created_at", { ascending: false });
    setItems((data as Activity[]) || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function post() {
    if (!body.trim()) return;
    const { error } = await supabase.from("activities").insert({
      activity_type: "feed",
      subject: "Status update",
      body,
      related_to_type: "feed",
      owner_name: displayName,
    });
    if (error) return toast(error.message, "error");
    toast("Posted", "success");
    setBody("");
    load();
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-lg font-semibold">Feeds</h1>
      <div className="mb-4 rounded border border-[var(--crm-border)] bg-white p-4">
        <textarea
          className="crm-input min-h-[80px]"
          placeholder="Share an update with your team…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button onClick={post} className="crm-btn crm-btn-primary">
            Post
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="rounded border border-[var(--crm-border)] bg-white p-4">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-[var(--crm-blue)]">
                {a.owner_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div className="text-sm font-medium">{a.subject || a.activity_type}</div>
                <div className="text-[11px] text-gray-400">
                  {a.owner_name || "User"} · {formatDateTime(a.created_at)}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
