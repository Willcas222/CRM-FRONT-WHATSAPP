"use client";

import { FullPageSpinner } from "@/components/ui/misc";
import { AutomationForm } from "../automation-form";
import { useRequireManage } from "../require-manage";

export default function NewAutomationPage() {
  const canManage = useRequireManage();
  if (!canManage) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Nueva automatización</h1>
      <AutomationForm />
    </div>
  );
}
