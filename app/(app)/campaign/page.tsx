"use client";

import { useState } from "react";

import { PageTitle } from "@/components/help/page-title";
import { FullPageSpinner } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { EventsTab } from "./events-tab";
import { KnowledgeTab } from "./knowledge-tab";
import { ProfileTab } from "./profile-tab";
import { useRequireCampaignVertical } from "./require-campaign";

const TABS = [
  { id: "profile", label: "Perfil" },
  { id: "knowledge", label: "Información" },
  { id: "events", label: "Eventos" },
] as const;

export default function CampaignPage() {
  const isCampaign = useRequireCampaignVertical();
  const { user } = useAuth();
  const canManage = user?.role === "OWNER" || user?.role === "ADMIN";
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("profile");

  if (!isCampaign) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <PageTitle
        topic="campaign"
        className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100"
      >
        Campaña
      </PageTitle>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab canManage={canManage} />}
      {tab === "knowledge" && <KnowledgeTab canManage={canManage} />}
      {tab === "events" && <EventsTab canManage={canManage} />}
    </div>
  );
}
