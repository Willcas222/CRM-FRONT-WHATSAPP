"use client";

/** Sesión del usuario (Fase 13). El token de acceso vive en memoria (`api-client.ts`); al cargar
 * la app se restaura con un refresh silencioso apoyado en la cookie httpOnly del backend. */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { ApiError, callApi, client, refreshSession, setAccessToken } from "./api-client";
import type { components } from "./api-schema";

type UserOut = components["schemas"]["UserOut"];
type AccountOut = components["schemas"]["AccountOut"];

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

/** Cierra la sesión sola si no hay actividad del usuario en este tiempo. */
const INACTIVITY_LIMIT_MS = 60 * 60 * 1000;
/** No reiniciar el temporizador más seguido que esto (evita miles de resets con `mousemove`). */
const ACTIVITY_THROTTLE_MS = 5_000;

interface AuthState {
  status: AuthStatus;
  user: UserOut | null;
  account: AccountOut | null;
  permissions: Set<string>;
}

interface RegisterInput {
  account_name: string;
  name: string;
  email: string;
  password: string;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refetchMe: () => Promise<void>;
}

const EMPTY_STATE: AuthState = {
  status: "loading",
  user: null,
  account: null,
  permissions: new Set(),
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(EMPTY_STATE);

  const loadMe = useCallback(async () => {
    const me = await callApi(() => client.GET("/api/v1/me"));
    setState({
      status: "authenticated",
      user: me.user,
      account: me.account,
      permissions: new Set(me.permissions),
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await refreshSession();
      if (!token) {
        if (!cancelled) setState({ ...EMPTY_STATE, status: "unauthenticated" });
        return;
      }
      try {
        await loadMe();
      } catch {
        if (!cancelled) setState({ ...EMPTY_STATE, status: "unauthenticated" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const auth = await callApi(() =>
        client.POST("/api/v1/auth/login", { body: { email, password } }),
      );
      setAccessToken(auth.access_token);
      await loadMe();
    },
    [loadMe],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const auth = await callApi(() => client.POST("/api/v1/auth/register", { body: input }));
      setAccessToken(auth.access_token);
      await loadMe();
    },
    [loadMe],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: { "X-Requested-With": "fetch" },
        credentials: "same-origin",
      });
    } finally {
      setAccessToken(null);
      setState({ ...EMPTY_STATE, status: "unauthenticated" });
    }
  }, []);

  useEffect(() => {
    if (state.status !== "authenticated") return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let lastReset = 0;

    function scheduleLogout() {
      timeoutId = setTimeout(() => void logout(), INACTIVITY_LIMIT_MS);
    }

    function onActivity() {
      const now = Date.now();
      if (now - lastReset < ACTIVITY_THROTTLE_MS) return;
      lastReset = now;
      clearTimeout(timeoutId);
      scheduleLogout();
    }

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"] as const;
    for (const event of events) window.addEventListener(event, onActivity, { passive: true });
    scheduleLogout();

    return () => {
      clearTimeout(timeoutId);
      for (const event of events) window.removeEventListener(event, onActivity);
    };
  }, [state.status, logout]);

  const hasPermission = useCallback(
    (permission: string) => state.permissions.has(permission),
    [state.permissions],
  );

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, hasPermission, refetchMe: loadMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return ctx;
}

export { ApiError };
