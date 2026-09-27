"use client";

/**
 * Cliente HTTP del panel SuperAdmin. Es un mundo de autenticación DISTINTO del de las
 * organizaciones: token propio (solo en memoria), cookie de refresh propia (`platform_refresh_token`,
 * ruta `/api/v1/superadmin/auth`) y su propio cliente. Nunca comparte token con `api-client.ts`,
 * así una sesión de organización no puede llamar a `/superadmin` ni al revés.
 */
import createClient, { type Middleware } from "openapi-fetch";

import { asApiError } from "./api-client";
import type { paths } from "./api-schema";

let platformToken: string | null = null;

export function setPlatformToken(token: string | null): void {
  platformToken = token;
}

let refreshing: Promise<string | null> | null = null;

/** `POST /superadmin/auth/refresh`: la cookie httpOnly viaja sola. Deduplica llamadas
 * concurrentes (dos refresh a la vez con el mismo token parecen un robo). */
export async function refreshPlatformSession(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const response = await fetch("/api/v1/superadmin/auth/refresh", {
        method: "POST",
        headers: { "X-Requested-With": "fetch" },
        credentials: "same-origin",
      });
      if (!response.ok) {
        platformToken = null;
        return null;
      }
      const data = (await response.json()) as { access_token: string };
      platformToken = data.access_token;
      return data.access_token;
    } catch {
      platformToken = null;
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

const authMiddleware: Middleware = {
  onRequest({ request }) {
    if (platformToken)
      request.headers.set("Authorization", `Bearer ${platformToken}`);
    return request;
  },
};

export const platformClient = createClient<paths>({ baseUrl: "/" });
platformClient.use(authMiddleware);

type ApiCall<T> = () => Promise<{
  data?: T;
  error?: unknown;
  response: Response;
}>;

/** Igual que `callApi`, pero con la sesión de plataforma: ante `TOKEN_EXPIRED` refresca una vez. */
export async function callPlatformApi<T>(call: ApiCall<T>): Promise<T> {
  let result = await call();
  if (result.response.status === 401) {
    const error = asApiError(result.response.status, result.error);
    if (error.code === "TOKEN_EXPIRED") {
      const token = await refreshPlatformSession();
      if (token) result = await call();
    }
  }
  if (result.error !== undefined || !result.response.ok) {
    throw asApiError(result.response.status, result.error);
  }
  return result.data as T;
}
