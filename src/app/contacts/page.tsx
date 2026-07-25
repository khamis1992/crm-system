"use client";
import { GenericListPage } from "@/components/GenericModule";
import { contactsConfig } from "@/lib/module-configs";
export default function Page() {
  return <GenericListPage config={contactsConfig} />;
}