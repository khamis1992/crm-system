"use client";

import { useEffect, useState } from "react";
import { supabase, type Lead, type Deal } from "@/lib/supabase";
import { formatMoney } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#2c5cc5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("leads").select("*"),
      supabase.from("deals").select("*"),
    ]).then(([l, d]) => {
      setLeads((l.data as Lead[]) || []);
      setDeals((d.data as Deal[]) || []);
    });
  }, []);

  const bySource = Object.entries(
    leads.reduce<Record<string, number>>((a, x) => {
      const k = x.lead_source || "Unknown";
      a[k] = (a[k] || 0) + 1;
      return a;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const byStage = Object.entries(
    deals.reduce<Record<string, number>>((a, x) => {
      const k = (x.stage || "Other").split("/")[0];
      a[k] = (a[k] || 0) + Number(x.amount || 0);
      return a;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const totalPipeline = deals
    .filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost")
    .reduce((s, d) => s + Number(d.amount || 0), 0);
  const won = deals
    .filter((d) => d.stage === "Closed Won")
    .reduce((s, d) => s + Number(d.amount || 0), 0);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-lg font-semibold">Analytics</h1>
        <p className="text-xs text-gray-500">Live metrics from Supabase zcrm schema</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Total Leads" value={String(leads.length)} />
        <Kpi label="Total Deals" value={String(deals.length)} />
        <Kpi label="Open Pipeline" value={formatMoney(totalPipeline)} />
        <Kpi label="Closed Won" value={formatMoney(won)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Leads by Source">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2c5cc5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Pipeline Amount by Stage">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStage} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byStage.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Deal Amount Trend (by created order)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deals.map((d, i) => ({ i: i + 1, amount: Number(d.amount || 0), name: d.deal_name }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="i" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Lead Status Mix">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(
                  leads.reduce<Record<string, number>>((a, x) => {
                    const k = x.lead_status || "Open";
                    a[k] = (a[k] || 0) + 1;
                    return a;
                  }, {})
                ).map(([name, value]) => ({ name, value }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[var(--crm-border)] bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-[var(--crm-blue)]">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-[var(--crm-border)] bg-white">
      <div className="border-b border-[var(--crm-border)] px-4 py-2.5 text-sm font-semibold">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}
