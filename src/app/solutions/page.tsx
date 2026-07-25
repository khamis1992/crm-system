"use client";
import { GenericListPage } from "@/components/GenericModule";
import { solutionsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={solutionsConfig} />;
}