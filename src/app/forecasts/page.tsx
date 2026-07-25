"use client";
import { GenericListPage } from "@/components/GenericModule";
import { forecastsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={forecastsConfig} />;
}