"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/misc";
import { ApiError, useAuth } from "@/lib/auth-context";

const schema = z.object({
  email: z.string().min(1, "Ingresa tu correo.").email("Correo no válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
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
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          CRM WhatsApp AI
        </h1>
        <p className="mt-1 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Inicia sesión en tu cuenta
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900"
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

          <Button type="submit" loading={isSubmitting} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          ¿Primera vez?{" "}
          <Link href="/register" className="font-medium text-emerald-700 dark:text-emerald-400">
            Crea tu cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
