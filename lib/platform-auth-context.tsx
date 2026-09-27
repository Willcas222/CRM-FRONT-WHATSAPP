"use client";

/** Sesión del SuperAdmin. Independiente de `AuthProvider` (organizaciones): solo envuelve `/admin`. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { ApiError } from "./api-client";
import type { components } from "./api-schema";
import {
  callPlatformApi,
  platformClient,
  refreshPlatformSession,
  setPlatformToken,
} from "./platform-client";

export type PlatformUser = components["schemas"]["PlatformUserOut"];

type Status = "loading" | "authenticated" | "unauthenticated";

/** Más corto que el de organizaciones: es una sesión de máximo privilegio. */
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 5_000;

/** Resultado del primer paso: sesión abierta, o falta el segundo factor. */
export type LoginResult =
  | { kind: "ok" }
  | { kind: "mfa"; challenge: string }
  | { kind: "enroll"; challenge: string };

export type MfaSetup = components["schemas"]["MfaSetupResponse"];

interface PlatformAuthValue {
  status: Status;
  user: PlatformUser | null;
  /** Solo el SuperAdmin cambia cosas; el rol de solo lectura consulta (el backend lo hace cumplir). */
  canWrite: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyMfa: (challenge: string, code: string) => Promise<void>;
  startEnrollment: (challenge: string) => Promise<MfaSetup>;
  /** Activa el doble factor obligatorio y abre la sesión. Devuelve los códigos de recuperación. */
  confirmEnrollment: (challenge: string, code: string) => Promise<string[]>;
  refreshUser: () => Promise<void>;
  finishEnrollment: () => void;
  logout: () => Promise<void>;
}

const PlatformAuthContext = createContext<PlatformAuthValue | null>(null);

export function PlatformAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<PlatformUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await refreshPlatformSession();
      if (!token) {
        if (!cancelled) setStatus("unauthenticated");
        return;
      }
      try {
        const me = await callPlatformApi(() =>
          platformClient.GET("/api/v1/superadmin/me"),
        );
        if (cancelled) return;
        setUser(me.user);
        setStatus("authenticated");
      } catch {
        if (!cancelled) setStatus("unauthenticated");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openSession = useCallback(
    (accessToken: string, sessionUser: PlatformUser) => {
      setPlatformToken(accessToken);
      setUser(sessionUser);
      setStatus("authenticated");
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const result = await callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/auth/login", {
          body: { email, password },
        }),
      );
      if (result.status === "OK" && result.access_token && result.user) {
        openSession(result.access_token, result.user);
        return { kind: "ok" };
      }
      if (!result.challenge_token)
        throw new Error("Respuesta de inicio de sesión incompleta.");
      return result.status === "MFA_ENROLLMENT_REQUIRED"
        ? { kind: "enroll", challenge: result.challenge_token }
        : { kind: "mfa", challenge: result.challenge_token };
    },
    [openSession],
  );

  const verifyMfa = useCallback(
    async (challenge: string, code: string) => {
      const auth = await callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/auth/mfa/verify", {
          body: { challenge_token: challenge, code },
        }),
      );
      openSession(auth.access_token, auth.user);
    },
    [openSession],
  );

  const startEnrollment = useCallback(
    (challenge: string) =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/auth/mfa/enroll/start", {
          body: { challenge_token: challenge },
        }),
      ),
    [],
  );

  const confirmEnrollment = useCallback(
    async (challenge: string, code: string) => {
      const result = await callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/auth/mfa/enroll/confirm", {
          body: { challenge_token: challenge, code },
        }),
      );
      // La sesión se abre DESPUÉS de mostrar los códigos: quien llama decide cuándo (ver login)
      setPlatformToken(result.access_token);
      setUser(result.user);
      return result.recovery_codes;
    },
    [],
  );

  const refreshUser = useCallback(async () => {
    const me = await callPlatformApi(() =>
      platformClient.GET("/api/v1/superadmin/me"),
    );
    setUser(me.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/v1/superadmin/auth/logout", {
        method: "POST",
        headers: { "X-Requested-With": "fetch" },
        credentials: "same-origin",
      });
    } finally {
      setPlatformToken(null);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

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

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ] as const;
    for (const event of events)
      window.addEventListener(event, onActivity, { passive: true });
    scheduleLogout();

    return () => {
      clearTimeout(timeoutId);
      for (const event of events) window.removeEventListener(event, onActivity);
    };
  }, [status, logout]);

  /** Termina la activación obligatoria una vez que la persona guardó sus códigos. */
  const finishEnrollment = useCallback(() => setStatus("authenticated"), []);

  return (
    <PlatformAuthContext.Provider
      value={{
        status,
        user,
        canWrite: user?.role === "SUPERADMIN",
        login,
        verifyMfa,
        startEnrollment,
        confirmEnrollment,
        refreshUser,
        finishEnrollment,
        logout,
      }}
    >
      {children}
    </PlatformAuthContext.Provider>
  );
}

export function usePlatformAuth(): PlatformAuthValue {
  const ctx = useContext(PlatformAuthContext);
  if (!ctx)
    throw new Error(
      "usePlatformAuth debe usarse dentro de <PlatformAuthProvider>.",
    );
  return ctx;
}

export { ApiError };
