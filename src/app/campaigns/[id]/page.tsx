"use client";
import { use } from "react";
import { GenericDetailPage } from "@/components/GenericModule";
import { campaignsConfig } from "@/lib/module-configs";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <GenericDetailPage config={campaignsConfig} id={id} />;
}