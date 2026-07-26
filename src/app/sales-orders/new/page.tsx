"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FormShell, FormSection, Field } from "@/components/FormShell";
import { LineItemsEditor, emptyLine, totalsFromLines, type LineItem } from "@/components/ui/LineItems";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";

export default function NewSalesOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { displayName } = useAuth();
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("Created");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [products, setProducts] = useState<{ product_name: string; unit_price: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems([emptyLine("so-0")]);
    supabase.from("products").select("product_name, unit_price").then(({ data }) => {
      setProducts((data as typeof products) || []);
    });
  }, []);

  async function save() {
    if (!subject.trim()) return setError("Subject is required");
    setSaving(true);
    const t = totalsFromLines(items);
    const { data, error: err } = await supabase
      .from("sales_orders")
      .insert({
        subject,
        status,
        due_date: dueDate || null,
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
    toast("Sales order created", "success");
    router.push(`/sales-orders/${data.id}`);
  }

  return (
    <FormShell title="Create Sales Order" backHref="/sales-orders" onSave={save} saving={saving}>
      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <FormSection title="Sales Order Information">
        <Field label="Subject" required>
          <input className="crm-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Status">
          <select className="crm-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {["Created", "Approved", "Delivered", "Cancelled"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Due Date">
          <input type="date" className="crm-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </FormSection>
      <div className="mb-6">
        <LineItemsEditor items={items} onChange={setItems} products={products} />
      </div>
    </FormShell>
  );
}
