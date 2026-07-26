"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FormShell, FormSection, Field } from "@/components/FormShell";
import { LineItemsEditor, emptyLine, totalsFromLines, type LineItem } from "@/components/ui/LineItems";
import { useToast } from "@/components/ui/Toast";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [status, setStatus] = useState("Created");
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [products, setProducts] = useState<{ product_name: string; unit_price: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems([emptyLine("po-0")]);
    supabase.from("products").select("product_name, unit_price").then(({ data }) => {
      setProducts((data as typeof products) || []);
    });
  }, []);

  async function save() {
    if (!subject.trim()) return setError("Subject is required");
    setSaving(true);
    const t = totalsFromLines(items);
    const { data, error: err } = await supabase
      .from("purchase_orders")
      .insert({
        subject,
        vendor_name: vendorName || null,
        status,
        po_date: poDate || null,
        due_date: dueDate || null,
        grand_total: t.grand_total,
      })
      .select("id")
      .single();
    setSaving(false);
    if (err) return setError(err.message);
    toast("Purchase order created", "success");
    router.push(`/purchase-orders/${data.id}`);
  }

  return (
    <FormShell title="Create Purchase Order" backHref="/purchase-orders" onSave={save} saving={saving}>
      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <FormSection title="Purchase Order Information">
        <Field label="Subject" required>
          <input className="crm-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Vendor Name">
          <input className="crm-input" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
        </Field>
        <Field label="Status">
          <select className="crm-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {["Created", "Approved", "Delivered", "Cancelled"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="PO Date">
          <input type="date" className="crm-input" value={poDate} onChange={(e) => setPoDate(e.target.value)} />
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
