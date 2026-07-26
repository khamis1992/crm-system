"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FormShell, FormSection, Field } from "@/components/FormShell";
import { LineItemsEditor, emptyLine, totalsFromLines, type LineItem } from "@/components/ui/LineItems";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";

export default function NewQuotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { displayName } = useAuth();
  const [subject, setSubject] = useState("");
  const [stage, setStage] = useState("Draft");
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [products, setProducts] = useState<{ product_name: string; unit_price: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems([emptyLine("quote-0")]);
    supabase.from("products").select("product_name, unit_price").then(({ data }) => {
      setProducts((data as typeof products) || []);
    });
  }, []);

  async function save() {
    if (!subject.trim()) return setError("Subject is required");
    setSaving(true);
    const t = totalsFromLines(items);
    const { data, error: err } = await supabase
      .from("quotes")
      .insert({
        subject,
        quote_stage: stage,
        valid_until: validUntil || null,
        sub_total: t.sub_total,
        discount: t.discount,
        tax: t.tax,
        grand_total: t.grand_total,
        owner_name: displayName,
      })
      .select("id")
      .single();
    setSaving(false);
    if (err) return setError(err.message);
    toast("Quote created", "success");
    router.push(`/quotes/${data.id}`);
  }

  return (
    <FormShell title="Create Quote" backHref="/quotes" onSave={save} saving={saving}>
      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <FormSection title="Quote Information">
        <Field label="Subject" required>
          <input className="crm-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Quote Stage">
          <select className="crm-input" value={stage} onChange={(e) => setStage(e.target.value)}>
            {["Draft", "Negotiation", "Delivered", "On Hold", "Confirmed", "Closed Won", "Closed Lost"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Valid Until">
          <input type="date" className="crm-input" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </Field>
      </FormSection>
      <div className="mb-6">
        <LineItemsEditor items={items} onChange={setItems} products={products} />
      </div>
    </FormShell>
  );
}
