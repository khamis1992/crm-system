"use client";

import { useId, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/utils";

export type LineItem = {
  id: string;
  product_name: string;
  quantity: number;
  list_price: number;
  discount: number;
  tax: number;
};

let clientSeq = 0;

/** Stable empty line — call only on client (button click / useEffect), never during SSR render init with random UUID */
export function emptyLine(seed?: string | number): LineItem {
  const id =
    typeof seed !== "undefined"
      ? `line-${seed}`
      : typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `line-${Date.now()}-${++clientSeq}`;
  return {
    id,
    product_name: "",
    quantity: 1,
    list_price: 0,
    discount: 0,
    tax: 0,
  };
}

export function lineTotal(l: LineItem) {
  const amount = l.quantity * l.list_price;
  return amount - l.discount + l.tax;
}

export function LineItemsEditor({
  items,
  onChange,
  products = [],
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  products?: { product_name: string; unit_price: number }[];
}) {
  const listId = useId();
  const seq = useRef(0);

  function update(id: string, patch: Partial<LineItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function addRow() {
    seq.current += 1;
    onChange([...items, emptyLine(`${listId}-${seq.current}`)]);
  }

  const sub = items.reduce((s, i) => s + i.quantity * i.list_price, 0);
  const disc = items.reduce((s, i) => s + i.discount, 0);
  const tax = items.reduce((s, i) => s + i.tax, 0);
  const grand = sub - disc + tax;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--crm-blue)]">Quoted / Ordered Items</h3>
        <button type="button" className="crm-btn crm-btn-secondary !py-1 !text-xs" onClick={addRow}>
          <Plus size={12} /> Add row
        </button>
      </div>
      <div className="overflow-x-auto rounded border border-[var(--crm-border)]">
        <table className="crm-table text-xs">
          <thead>
            <tr>
              <th>Product</th>
              <th style={{ width: 80 }}>Qty</th>
              <th style={{ width: 110 }}>List Price</th>
              <th style={{ width: 100 }}>Discount</th>
              <th style={{ width: 90 }}>Tax</th>
              <th style={{ width: 110 }}>Total</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const dlId = `${listId}-${item.id}`;
              return (
                <tr key={item.id}>
                  <td>
                    <input
                      list={dlId}
                      className="crm-input !py-1"
                      value={item.product_name}
                      onChange={(e) => {
                        const p = products.find((x) => x.product_name === e.target.value);
                        update(item.id, {
                          product_name: e.target.value,
                          list_price: p ? Number(p.unit_price) : item.list_price,
                        });
                      }}
                      placeholder="Product name"
                    />
                    <datalist id={dlId}>
                      {products.map((p) => (
                        <option key={p.product_name} value={p.product_name} />
                      ))}
                    </datalist>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="crm-input !py-1"
                      value={item.quantity}
                      onChange={(e) => update(item.id, { quantity: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="crm-input !py-1"
                      value={item.list_price}
                      onChange={(e) => update(item.id, { list_price: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="crm-input !py-1"
                      value={item.discount}
                      onChange={(e) => update(item.id, { discount: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="crm-input !py-1"
                      value={item.tax}
                      onChange={(e) => update(item.id, { tax: Number(e.target.value) })}
                    />
                  </td>
                  <td className="font-medium">{formatMoney(lineTotal(item))}</td>
                  <td>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-600"
                      onClick={() => onChange(items.filter((i) => i.id !== item.id))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="!py-6 text-center text-gray-400">
                  No line items — click Add row
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 ml-auto w-64 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Sub Total</span>
          <span>{formatMoney(sub)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Discount</span>
          <span>{formatMoney(disc)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tax</span>
          <span>{formatMoney(tax)}</span>
        </div>
        <div className="flex justify-between border-t pt-1 font-semibold">
          <span>Grand Total</span>
          <span className="text-[var(--crm-blue)]">{formatMoney(grand)}</span>
        </div>
      </div>
    </div>
  );
}

export function totalsFromLines(items: LineItem[]) {
  const sub_total = items.reduce((s, i) => s + i.quantity * i.list_price, 0);
  const discount = items.reduce((s, i) => s + i.discount, 0);
  const tax = items.reduce((s, i) => s + i.tax, 0);
  return { sub_total, discount, tax, grand_total: sub_total - discount + tax };
}
