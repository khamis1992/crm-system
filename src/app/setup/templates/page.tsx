"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { getSetting, saveSetting } from "@/lib/settings";

type Tpl = { id: string; name: string; folder: string; subject: string; body: string; type: string; modified: string };

export default function TemplatesPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"email" | "inventory" | "mailmerge">("email");
  const [folder, setFolder] = useState("All Templates");
  const [builder, setBuilder] = useState(false);
  const [templates, setTemplates] = useState<Tpl[]>([]);
  const [form, setForm] = useState({ name: "New Template", subject: "Following up", body: "Hello {{First_Name}},\n\nThank you for your interest in our products…" });

  const load = useCallback(async () => {
    const data = await getSetting<Tpl[]>("email_templates", []);
    setTemplates(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = templates.filter((t) => {
    if (tab === "email" && t.type !== "email") return false;
    if (tab === "inventory" && t.type !== "inventory") return false;
    if (folder === "All Templates") return true;
    return t.folder === folder;
  });

  async function saveTemplate() {
    const tpl: Tpl = {
      id: crypto.randomUUID(),
      name: form.name || "Untitled",
      folder: "Personal",
      subject: form.subject,
      body: form.body,
      type: tab === "inventory" ? "inventory" : "email",
      modified: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    const next = [tpl, ...templates];
    setTemplates(next);
    const { error } = await saveSetting("email_templates", next);
    await supabase.from("activities").insert({
      activity_type: "template",
      subject: `Template saved: ${tpl.name}`,
      body: tpl.subject,
      related_to_type: "setup",
    });
    if (error) toast(error, "error");
    else toast("Template saved", "success");
    setBuilder(false);
  }

  async function remove(id: string) {
    const next = templates.filter((t) => t.id !== id);
    setTemplates(next);
    await saveSetting("email_templates", next);
    toast("Template deleted", "success");
  }

  async function uploadMailMerge(file?: File) {
    if (!file) return;
    const next = [
      {
        id: crypto.randomUUID(),
        name: file.name,
        folder: "Personal",
        subject: file.name,
        body: "",
        type: "mailmerge",
        modified: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      },
      ...templates,
    ];
    setTemplates(next);
    await saveSetting("email_templates", next);
    toast(`Uploaded ${file.name}`, "success");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/setup" className="rounded p-1 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
          <h1 className="text-lg font-semibold">Templates</h1>
        </div>
        <button className="crm-btn crm-btn-primary" onClick={() => setBuilder(true)}>+ New Template</button>
      </div>
      <div className="flex gap-1 border-b bg-white px-4">
        {[
          ["email", "Email Templates"],
          ["inventory", "Inventory Templates"],
          ["mailmerge", "Mail Merge"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k as typeof tab)}
            className={cn("border-b-2 px-3 py-2.5 text-sm", tab === k ? "border-[var(--crm-blue)] font-semibold text-[var(--crm-blue)]" : "border-transparent text-gray-500")}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 border-r bg-white p-3 text-xs">
          <div className="mb-2 font-semibold text-gray-400">Folders</div>
          {["All Templates", "Public", "Personal", "Shared"].map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={cn("mb-1 block w-full rounded px-2 py-1.5 text-left hover:bg-blue-50", folder === f && "bg-blue-50 text-[var(--crm-blue)]")}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-4">
          {tab === "mailmerge" ? (
            <div className="rounded border bg-white p-8 text-center text-sm text-gray-500">
              Upload MS Word mail-merge templates (.docx) with merge fields.
              <div className="mt-3">
                <label className="crm-btn crm-btn-primary !text-xs cursor-pointer">
                  Upload Template
                  <input type="file" accept=".docx,.doc" className="hidden" onChange={(e) => uploadMailMerge(e.target.files?.[0])} />
                </label>
              </div>
              {templates.filter((t) => t.type === "mailmerge").length > 0 && (
                <ul className="mt-6 space-y-2 text-left">
                  {templates.filter((t) => t.type === "mailmerge").map((t) => (
                    <li key={t.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                      <span>{t.name}</span>
                      <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded border bg-white">
              <table className="crm-table text-xs">
                <thead><tr><th>Name</th><th>Folder</th><th>Modified</th><th /></tr></thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-400">No templates — create one</td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <button
                          className="font-medium text-[var(--crm-blue)]"
                          onClick={() => {
                            setForm({ name: r.name, subject: r.subject, body: r.body });
                            setBuilder(true);
                          }}
                        >
                          {r.name}
                        </button>
                      </td>
                      <td>{r.folder}</td>
                      <td>{r.modified}</td>
                      <td>
                        <button className="text-gray-400 hover:text-red-500" onClick={() => remove(r.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {builder && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">Template Builder</h2>
            <div className="flex gap-2">
              <button className="crm-btn crm-btn-secondary" onClick={() => setBuilder(false)}>Cancel</button>
              <button className="crm-btn crm-btn-primary" onClick={saveTemplate}>Save</button>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-4 overflow-hidden">
            <div className="border-r p-3 text-xs">
              <div className="mb-2 font-semibold">Merge Fields</div>
              {["{{First_Name}}", "{{Last_Name}}", "{{Company}}", "{{Email}}", "{{Deal_Name}}"].map((s) => (
                <button
                  key={s}
                  className="mb-1 block w-full rounded border px-2 py-1.5 text-left hover:bg-blue-50"
                  onClick={() => setForm({ ...form, body: form.body + " " + s })}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="col-span-2 overflow-auto bg-gray-100 p-6">
              <div className="mx-auto min-h-[400px] max-w-lg rounded bg-white p-6 shadow">
                <textarea
                  className="min-h-[320px] w-full resize-none border-0 text-sm outline-none"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
              </div>
            </div>
            <div className="border-l p-3 text-xs">
              <div className="mb-2 font-semibold">Properties</div>
              <label className="crm-label">Template Name</label>
              <input className="crm-input mb-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <label className="crm-label">Subject</label>
              <input className="crm-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
