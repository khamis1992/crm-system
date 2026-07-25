"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { meetingsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={meetingsConfig} />;
}