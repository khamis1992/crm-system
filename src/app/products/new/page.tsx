"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { productsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={productsConfig} />;
}