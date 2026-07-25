"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { priceBooksConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={priceBooksConfig} />;
}