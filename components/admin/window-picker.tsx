"use client";

import { useMemo, useState } from "react";

import type { AnalyticsWindow } from "@/lib/hooks/admin-analytics";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { days: 1, label: "24 h" },
  { days: 7, label: "7 días" },
  { days: 30, label: "30 días" },
  { days: 90, label: "90 días" },
] as const;

/** Ventana relativa terminada «ahora». `since` se fija al elegir (no en cada render) para que
 * la clave de caché de React Query sea estable. */
export function useAnalyticsWindow(defaultDays = 30) {
  const [days, setDays] = useState<number>(defaultDays);
  const [anchor] = useState(() => Date.now());
  const window: AnalyticsWindow = useMemo(
    () => ({ since: new Date(anchor - days * 86_400_000).toISOString() }),
    [anchor, days],
  );
  return { days, setDays, window };
}

export function WindowPicker({
  days,
  onChange,
}: {
  days: number;
  onChange: (days: number) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
      {OPTIONS.map((option) => (
        <button
          key={option.days}
          onClick={() => onChange(option.days)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            days === option.days
              ? "bg-indigo-600 text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
