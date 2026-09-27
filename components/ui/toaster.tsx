"use client";

import { dismissToast, useToasts, type ToastKind } from "@/lib/toast";
import { cn } from "@/lib/utils";

const STYLES: Record<ToastKind, { box: string; icon: string; symbol: string }> =
  {
    success: {
      box: "border-emerald-300 bg-white text-zinc-900 dark:border-emerald-700 dark:bg-zinc-900 dark:text-zinc-50",
      icon: "bg-emerald-500 text-white",
      symbol: "✓",
    },
    error: {
      box: "border-red-300 bg-white text-zinc-900 dark:border-red-800 dark:bg-zinc-900 dark:text-zinc-50",
      icon: "bg-red-500 text-white",
      symbol: "!",
    },
    info: {
      box: "border-sky-300 bg-white text-zinc-900 dark:border-sky-800 dark:bg-zinc-900 dark:text-zinc-50",
      icon: "bg-sky-500 text-white",
      symbol: "i",
    },
  };

/**
 * Avisos flotantes no invasivos: esquina inferior derecha (centrados abajo en móvil), no tapan la
 * pantalla ni bloquean lo de atrás (solo el aviso en sí recibe clics) y se cierran solos.
 */
export function Toaster() {
  const toasts = useToasts();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end sm:px-0"
    >
      {toasts.map((t) => {
        const style = STYLES[t.kind];
        return (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm animate-[toast-in_180ms_ease-out] items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
              style.box,
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                style.icon,
              )}
            >
              {style.symbol}
            </span>
            <p className="min-w-0 flex-1 break-words text-sm leading-snug">
              {t.message}
            </p>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Cerrar aviso"
              className="-mr-1 -mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
