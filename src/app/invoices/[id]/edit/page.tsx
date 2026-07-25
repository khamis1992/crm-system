"use client";
import { use } from "react";
import { GenericEditPage } from "@/components/GenericModule";
import { invoicesConfig } from "@/lib/module-configs";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <GenericEditPage config={invoicesConfig} id={id} />;
}