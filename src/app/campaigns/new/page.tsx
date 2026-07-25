"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { campaignsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={campaignsConfig} />;
}