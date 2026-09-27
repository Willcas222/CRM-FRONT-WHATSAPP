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
  account_name: z.string().min(1, "Ingresa el nombre de tu empresa."),
  name: z.string().min(1, "Ingresa tu nombre."),
  email: z.string().min(1, "Ingresa tu correo.").email("Correo no válido."),
  password: z
    .string()
    .min(10, "La contraseña debe tener al menos 10 caracteres.")
    .max(128, "La contraseña es demasiado larga."),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const hydrated = useHydrated();
  const { status, register: registerAccount } = useAuth();
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
      await registerAccount(values);
      router.replace("/dashboard");
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "No se pudo conectar con el servidor. Intenta de nuevo.",
      );
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-800 via-sidebar to-zinc-950 p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-white">
          Crea tu cuenta
        </h1>
        <p className="mt-1 text-center text-sm text-emerald-100/80">
          Serás la propietaria de la cuenta
        </p>

        <form
          method="post"
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white p-7 shadow-2xl dark:bg-zinc-900"
        >
          {serverError && <ErrorBanner message={serverError} />}

          <div>
            <Label htmlFor="account_name">Empresa</Label>
            <Input
              id="account_name"
              error={errors.account_name?.message}
              {...register("account_name")}
            />
          </div>

          <div>
            <Label htmlFor="name">Tu nombre</Label>
            <Input
              id="name"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>

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
              autoComplete="new-password"
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
            Crear cuenta
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-emerald-100/80">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-white underline underline-offset-2"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
