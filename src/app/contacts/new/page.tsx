"use client";
import { GenericNewPage } from "@/components/GenericModule";
import { contactsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericNewPage config={contactsConfig} />;
}