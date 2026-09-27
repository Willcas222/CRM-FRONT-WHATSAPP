"use client";

/**
 * Cliente HTTP tipado (Fase 13). `paths` sale de `lib/api-schema.ts` (generado desde el OpenAPI
 * real del backend, `npm run generate-types`): la forma de cada ruta, parámetro y cuerpo es la
 * del contrato real, no una copia hecha a mano que se puede desincronizar.
 *
 * El formato de error real del backend (`{"error": {code, message, details, request_id}}`,
 * API.md 1.2) no queda reflejado en el OpenAPI de FastAPI para los códigos que no son 422 (ese
 * es un límite de cómo FastAPI genera el esquema, no algo que se pueda corregir desde aquí), así
 * que `error` se relee con `asApiError` en vez de confiar en el tipo que infiere openapi-fetch.
 */
import createClient, { type Middleware } from "openapi-fetch";

import type { paths } from "./api-schema";

export interface ApiErrorDetail {
  field: string;
  issue: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details: ApiErrorDetail[];
  request_id?: string;
}

export class ApiError extends Error {
  code: string;
  details: ApiErrorDetail[];
  requestId?: string;
  status: number;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.details = body.details;
    this.requestId = body.request_id;
  }
}

/** Ve si `raw` tiene la forma real de un error del backend; si no, arma un mensaje genérico. */
export function asApiError(status: number, raw: unknown): ApiError {
  const body = raw as { error?: Partial<ApiErrorBody> } | undefined;
  if (body?.error?.code && body.error.message) {
    return new ApiError(status, {
      code: body.error.code,
      message: body.error.message,
      details: body.error.details ?? [],
      request_id: body.error.request_id,
    });
  }
  return new ApiError(status, {
    code: status === 0 ? "NETWORK_ERROR" : "UNKNOWN_ERROR",
    message: "Ocurrió un error inesperado. Intenta de nuevo.",
    details: [],
  });
}

// El token de acceso vive SOLO en memoria (nunca en localStorage): un XSS que lea localStorage
// no debe llevarse un token vigente. Se restaura al cargar la app con un refresh silencioso
// (AuthProvider), apoyado en la cookie httpOnly que el backend ya puso.
let accessToken: string | null = null;
const listeners = new Set<(token: string | null) => void>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  for (const listener of listeners) listener(token);
}

export function onAccessTokenChange(
  listener: (token: string | null) => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let refreshing: Promise<string | null> | null = null;

/** `POST /auth/refresh`: la cookie de refresh es httpOnly, el navegador la manda solo. El
 * backend exige serializar los refresh (dos a la vez con el mismo token parecen un robo,
 * API.md 2.1); `refreshing` deduplica llamadas concurrentes en la pestaña. */
export async function refreshSession(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const response = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "X-Requested-With": "fetch" },
        credentials: "same-origin",
      });
      if (!response.ok) {
        setAccessToken(null);
        return null;
      }
      const data = (await response.json()) as { access_token: string };
      setAccessToken(data.access_token);
      return data.access_token;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

const authMiddleware: Middleware = {
  onRequest({ request }) {
    if (accessToken)
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    return request;
  },
};

export const client = createClient<paths>({ baseUrl: "/" });
client.use(authMiddleware);

type ApiCall<T> = () => Promise<{
  data?: T;
  error?: unknown;
  response: Response;
}>;

/** Envuelve una llamada de `client.GET/POST/...`: si el access token expiró (401
 * `TOKEN_EXPIRED`), intenta un refresh silencioso UNA vez y reintenta la petición original. */
export async function callApi<T>(call: ApiCall<T>): Promise<T> {
  let result = await call();
  if (result.response.status === 401) {
    const error = asApiError(result.response.status, result.error);
    if (error.code === "TOKEN_EXPIRED") {
      const token = await refreshSession();
      if (token) result = await call();
    }
  }
  if (result.error !== undefined || !result.response.ok) {
    throw asApiError(result.response.status, result.error);
  }
  return result.data as T;
}
