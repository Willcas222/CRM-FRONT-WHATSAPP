"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { getTopic, HELP_PATH, type HelpAudience } from "@/lib/help";
import { cn } from "@/lib/utils";

const PANEL_WIDTH = 352;
const MARGIN = 12;

/**
 * El «!» de cada sección: abre un resumen de cómo funciona la pantalla, sin salir de ella.
 * En pantallas anchas es un popover junto al botón; en móvil, una hoja desde abajo.
 * El contenido sale de `lib/help` (la misma fuente que la página Ayuda y los manuales).
 */
export function HelpButton({
  topic,
  audience = "organization",
  className,
}: {
  topic: string;
  audience?: HelpAudience;
  className?: string;
}) {
  const data = getTopic(audience, topic);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);

  // Al abrir se calcula dónde poner el popover (junto al botón y sin salirse de la pantalla).
  // En móvil (<640px) es una hoja pegada abajo y no necesita coordenadas.
  function toggle() {
    if (open) return setOpen(false);
    if (button.current && window.innerWidth >= 640) {
      const rect = button.current.getBoundingClientRect();
      const left = Math.min(
        Math.max(MARGIN, rect.left),
        window.innerWidth - PANEL_WIDTH - MARGIN,
      );
      setPosition({ top: rect.bottom + 8, left });
    } else {
      setPosition(null);
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (panel.current?.contains(target) || button.current?.contains(target))
        return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, close]);

  if (!data) return null;

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={toggle}
        aria-label={`Ayuda: ${data.title}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={`¿Cómo funciona «${data.title}»?`}
        className={cn(
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-600/40 text-[13px] font-bold leading-none text-emerald-700 transition-colors hover:bg-emerald-50",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
          "dark:border-emerald-400/40 dark:text-emerald-300 dark:hover:bg-emerald-900/30",
          open &&
            "bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:text-zinc-950",
          className,
        )}
      >
        !
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] sm:pointer-events-none">
            <div
              className="absolute inset-0 bg-black/40 sm:hidden"
              aria-hidden
              onClick={close}
            />
            <div
              ref={panel}
              role="dialog"
              aria-label={`Ayuda: ${data.title}`}
              tabIndex={-1}
              style={
                position
                  ? {
                      top: position.top,
                      left: position.left,
                      width: PANEL_WIDTH,
                    }
                  : undefined
              }
              className={cn(
                "pointer-events-auto absolute overflow-y-auto bg-white p-5 text-left shadow-2xl outline-none dark:bg-zinc-900",
                // móvil: hoja desde abajo · escritorio: popover junto al botón
                "inset-x-0 bottom-0 max-h-[80dvh] rounded-t-2xl sm:inset-x-auto sm:bottom-auto sm:max-h-[min(34rem,calc(100dvh-6rem))] sm:rounded-2xl sm:border sm:border-zinc-200 sm:dark:border-zinc-700",
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {data.title}
                </h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Cerrar ayuda"
                  className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {data.summary}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                {data.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`${HELP_PATH[audience]}#${data.id}`}
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
              >
                Ver la guía completa →
              </Link>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
