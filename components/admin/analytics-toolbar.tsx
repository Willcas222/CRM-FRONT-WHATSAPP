"use client";

import { useState } from "react";

import { AccountFilter } from "@/components/admin/account-filter";
import {
  useAnalyticsWindow,
  WindowPicker,
} from "@/components/admin/window-picker";
import type { AnalyticsWindow } from "@/lib/hooks/admin-analytics";

/** Ventana de tiempo + filtro por organización, compartidos por las vistas de consumo. */
export function useAnalyticsControls(defaultDays = 30) {
  const { days, setDays, window } = useAnalyticsWindow(defaultDays);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const query: AnalyticsWindow = {
    ...window,
    ...(accountId ? { account_id: accountId } : {}),
  };
  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <AccountFilter accountId={accountId} onChange={setAccountId} />
      <WindowPicker days={days} onChange={setDays} />
    </div>
  );
  return { query, toolbar };
}
