"use client";
import { GenericListPage } from "@/components/GenericModule";
import { campaignsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={campaignsConfig} />;
}