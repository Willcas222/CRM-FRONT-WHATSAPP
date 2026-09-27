"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api-client";
import { AuthProvider } from "@/lib/auth-context";
import { toast, type MutationToastMeta } from "@/lib/toast";

/** Cada cuánto se refrescan solos los datos visibles (solo con la pestaña a la vista). */
const POLL_TENANT_MS = 8_000;
const POLL_ADMIN_MS = 15_000;
const POLL_ANALYTICS_MS = 60_000;

function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429)
      return "Demasiadas acciones seguidas. Espera un momento e inténtalo de nuevo.";
    return error.message || "No se pudo guardar el cambio.";
  }
  return "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
}

function createClient(): QueryClient {
  const client: QueryClient = new QueryClient({
    // Aviso automático para TODA acción que cambia algo, sin tocar pantalla por pantalla: «se guardó» o
    // «no se guardó». Un hook puede personalizarlo o silenciarlo con `meta` (ver `lib/toast.ts`).
    mutationCache: new MutationCache({
      onSuccess: (_data, _vars, _ctx, mutation) => {
        const meta = mutation.meta as MutationToastMeta | undefined;
        if (meta?.success !== false)
          toast.success(meta?.success ?? "Guardado correctamente.");
        // El cambio se ve al instante en cada pantalla abierta, sin esperar al siguiente refresco
        void client.invalidateQueries();
      },
      onError: (error, _vars, _ctx, mutation) => {
        const meta = mutation.meta as MutationToastMeta | undefined;
        if (meta?.error === false) return;
        toast.error(meta?.error ?? errorText(error));
      },
    }),
    defaultOptions: {
      queries: {
        // Casi en tiempo real: lo que cambia otra persona (o el SuperAdmin) aparece en segundos, sin
        // recargar. Además se refresca al volver a la pestaña o al recuperar la conexión.
        staleTime: 5_000,
        retry: 1,
        refetchInterval: POLL_TENANT_MS,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  });
  // El panel de administración: menos frecuente, y las analíticas (consultas pesadas) aún menos
  client.setQueryDefaults(["admin"], { refetchInterval: POLL_ADMIN_MS });
  client.setQueryDefaults(["admin", "analytics"], {
    refetchInterval: POLL_ANALYTICS_MS,
  });
  return client;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
