"use client";
import { GenericListPage } from "@/components/GenericModule";
import { meetingsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={meetingsConfig} />;
}