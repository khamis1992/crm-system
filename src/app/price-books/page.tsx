"use client";
import { GenericListPage } from "@/components/GenericModule";
import { priceBooksConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={priceBooksConfig} />;
}