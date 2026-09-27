"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import { Input, Label } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/misc";
import { ApiError, useAuth } from "@/lib/auth-context";

const schema = z.object({
  email: z.string().min(1, "Ingresa tu correo.").email("Correo no válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const hydrated = useHydrated();
  const { status, login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      router.replace("/dashboard");
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? "Correo o contraseña incorrectos."
          : "No se pudo conectar con el servidor. Intenta de nuevo.",
      );
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-800 via-sidebar to-zinc-950 p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-white">
          CRM WhatsApp AI
        </h1>
        <p className="mt-1 text-center text-sm text-emerald-100/80">
          Inicia sesión en tu cuenta
        </p>

        <form
          method="post"
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white p-7 shadow-2xl dark:bg-zinc-900"
        >
          {serverError && <ErrorBanner message={serverError} />}

          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!hydrated}
            className="w-full"
          >
            Entrar
          </Button>
          <p className="text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-emerald-700 underline underline-offset-2 dark:text-emerald-300"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center text-sm text-emerald-100/80">
          ¿Primera vez?{" "}
          <Link
            href="/register"
            className="font-semibold text-white underline underline-offset-2"
          >
            Crea tu cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
