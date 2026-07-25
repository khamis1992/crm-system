"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { forecastsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={forecastsConfig} />;
}