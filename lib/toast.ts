"use client";

import { useSyncExternalStore } from "react";

/**
 * Avisos flotantes («se guardó», «no se pudo guardar»). Un almacén externo a React, para poder avisar
 * desde cualquier parte: un componente, un hook o la capa de consultas (ver `app/providers.tsx`).
 */
export type ToastKind = "success" | "error" | "info";

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const MAX_VISIBLE = 4;
const DURATION_MS: Record<ToastKind, number> = {
  success: 3500,
  info: 4500,
  error: 7000,
};

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener();
}

export function dismissToast(id: number) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(kind: ToastKind, message: string) {
  // El mismo aviso repetido (dos guardados seguidos) no se apila: se renueva el que ya está
  const existing = toasts.find((t) => t.kind === kind && t.message === message);
  if (existing) dismissToast(existing.id);
  const toast: Toast = { id: nextId++, kind, message };
  toasts = [...toasts, toast].slice(-MAX_VISIBLE);
  timers.set(
    toast.id,
    setTimeout(() => dismissToast(toast.id), DURATION_MS[kind]),
  );
  emit();
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const EMPTY: Toast[] = [];

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    subscribe,
    () => toasts,
    () => EMPTY,
  );
}

/** Opciones que un hook puede declarar en `meta` de `useMutation` para personalizar su aviso. */
export interface MutationToastMeta extends Record<string, unknown> {
  /** Texto del aviso de éxito. `false` = sin aviso de éxito (p. ej. marcar como leído). */
  success?: string | false;
  /** Texto del aviso de error. `false` = sin aviso (el llamador ya lo muestra a su manera). */
  error?: string | false;
}
