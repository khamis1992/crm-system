"use client";
import { use } from "react";
import { GenericEditPage } from "@/components/GenericModule";
import { accountsConfig } from "@/lib/module-configs";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <GenericEditPage config={accountsConfig} id={id} />;
}