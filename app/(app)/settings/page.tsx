"use client";

import { useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { AccountTab } from "./account-tab";
import { BotTab } from "./bot-tab";
import { InboxesTab } from "./inboxes-tab";
import { PipelinesTab } from "./pipelines-tab";
import { UsersTab } from "./users-tab";
import { PageTitle } from "@/components/help/page-title";

const TABS = [
  { id: "account", label: "Cuenta", requiresManage: false },
  { id: "users", label: "Usuarios", requiresManage: true },
  { id: "inboxes", label: "Canales", requiresManage: true },
  { id: "pipelines", label: "Pipeline", requiresManage: true },
  { id: "bot", label: "Bot", requiresManage: true },
] as const;

const SETTINGS_TOPICS = {
  account: "settings-account",
  users: "settings-users",
  inboxes: "settings-channels",
  pipelines: "settings-pipeline",
  bot: "settings-bot",
} as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "OWNER" || user?.role === "ADMIN";
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("account");

  const visibleTabs = TABS.filter((t) => !t.requiresManage || canManage);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <PageTitle
        topic={SETTINGS_TOPICS[tab]}
        className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100"
      >
        Configuración
      </PageTitle>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
        {visibleTabs.map((t) => (
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

      {tab === "account" && <AccountTab />}
      {tab === "users" && canManage && <UsersTab />}
      {tab === "inboxes" && canManage && <InboxesTab />}
      {tab === "pipelines" && canManage && <PipelinesTab />}
      {tab === "bot" && canManage && <BotTab />}
    </div>
  );
}
