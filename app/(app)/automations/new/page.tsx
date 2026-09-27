"use client";

import { PageTitle } from "@/components/help/page-title";
import { FullPageSpinner } from "@/components/ui/misc";
import { AutomationForm } from "../automation-form";
import { useRequireManage } from "../require-manage";

export default function NewAutomationPage() {
  const canManage = useRequireManage();
  if (!canManage) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <PageTitle
        topic="automations"
        className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100"
      >
        Nueva automatización
      </PageTitle>
      <AutomationForm />
    </div>
  );
}
