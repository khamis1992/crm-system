"use client";
import { GenericListPage } from "@/components/GenericModule";
import { productsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={productsConfig} />;
}