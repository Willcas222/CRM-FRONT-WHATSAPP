"use client";

import { useState } from "react";

import { ConfirmReasonModal } from "@/components/admin/confirm-reason-modal";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import type { components } from "@/lib/api-schema";
import { useMaintenance, useSetMaintenance } from "@/lib/hooks/admin-settings";

type Maintenance = components["schemas"]["MaintenanceOut"];

const SERVICE_LABEL: Record<string, { label: string; hint: string }> = {
  whatsapp: {
    label: "WhatsApp (envíos)",
    hint: "No se puede enviar ningún mensaje saliente.",
  },
  ai: {
    label: "IA (bot)",
    hint: "Los turnos del bot se aplazan; nada pasa a un humano.",
  },
  crm: {
    label: "CRM (API de las cuentas)",
    hint: "Los usuarios reciben 503 con el mensaje.",
  },
};

/** ISO -> valor de `<input type="datetime-local">` en hora local. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export default function AdminMaintenancePage() {
  const { data, isLoading, error } = useMaintenance();

  return (
    <>
      <PageHeader
        title="Modo mantenimiento"
        help="maintenance"
        description="Corta, por completo o por servicio, lo que ven y usan las organizaciones. El panel SuperAdmin nunca se corta."
      />
      {isLoading && <FullPageSpinner />}
      {error && (
        <ErrorBanner message="No se pudo cargar el estado de mantenimiento." />
      )}
      {data && (
        <div className="space-y-6">
          <StatusBanner current={data} />
          <MaintenanceForm
            key={JSON.stringify([
              data.enabled,
              data.services,
              data.starts_at,
              data.ends_at,
              data.message,
            ])}
            current={data}
          />
        </div>
      )}
    </>
  );
}

function StatusBanner({ current }: { current: Maintenance }) {
  const { status } = current;
  if (!status.active_now) {
    return (
      <Card className="flex items-center gap-3 p-4">
        <Badge tone="green">Operación normal</Badge>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {current.enabled || Object.keys(current.services).length > 0
            ? "Hay un mantenimiento programado que todavía no rige (o ya terminó)."
            : "Nada está en mantenimiento."}
        </span>
      </Card>
    );
  }
  return (
    <Card className="border-red-300 p-4 dark:border-red-900">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="red">EN MANTENIMIENTO AHORA</Badge>
        {status.is_global ? (
          <Badge tone="red">Global</Badge>
        ) : (
          status.services.map((s) => (
            <Badge key={s} tone="amber">
              {SERVICE_LABEL[s]?.label ?? s}
            </Badge>
          ))
        )}
      </div>
      {status.retry_after_seconds != null && status.retry_after_seconds > 0 && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Termina en aproximadamente{" "}
          {Math.ceil(status.retry_after_seconds / 60)} min.
        </p>
      )}
    </Card>
  );
}

function MaintenanceForm({ current }: { current: Maintenance }) {
  const mutation = useSetMaintenance();
  const [enabled, setEnabled] = useState(current.enabled);
  const [services, setServices] = useState<Record<string, boolean>>(
    current.services,
  );
  const [startsAt, setStartsAt] = useState(toLocalInput(current.starts_at));
  const [endsAt, setEndsAt] = useState(toLocalInput(current.ends_at));
  const [message, setMessage] = useState(current.message ?? "");
  const [confirming, setConfirming] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const anyOn = enabled || Object.values(services).some(Boolean);

  function validate(): boolean {
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setFormError("La fecha de fin debe ser posterior a la de inicio.");
      return false;
    }
    setFormError(null);
    return true;
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-6 p-4">
        {formError && <ErrorBanner message={formError} />}

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          <span>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              Mantenimiento GLOBAL
            </span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              Corta la API de las cuentas, el bot y los envíos a la vez.
            </span>
          </span>
        </label>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Solo estos servicios
          </legend>
          {current.available_services.map((name) => (
            <label key={name} className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={services[name] === true}
                disabled={enabled}
                onChange={(event) =>
                  setServices({ ...services, [name]: event.target.checked })
                }
              />
              <span>
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {SERVICE_LABEL[name]?.label ?? name}
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {SERVICE_LABEL[name]?.hint}
                </span>
              </span>
            </label>
          ))}
          {enabled && (
            <p className="text-xs text-zinc-500">
              El mantenimiento global ya incluye todos los servicios.
            </p>
          )}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="starts">Inicio programado (opcional)</Label>
            <Input
              id="starts"
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ends">Fin (opcional)</Label>
            <Input
              id="ends"
              type="datetime-local"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
            />
          </div>
        </div>
        <p className="-mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Sin inicio, rige de inmediato. Sin fin, dura hasta que lo desactives.
          Las horas son las de tu navegador.
        </p>

        <div>
          <Label htmlFor="message">Mensaje para los usuarios</Label>
          <Textarea
            id="message"
            rows={3}
            maxLength={500}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Volvemos en unos minutos. Gracias por tu paciencia."
          />
        </div>

        <div className="flex justify-end gap-2">
          {anyOn && (
            <Button
              variant="secondary"
              onClick={() => {
                setEnabled(false);
                setServices({});
                setStartsAt("");
                setEndsAt("");
              }}
            >
              Vaciar formulario
            </Button>
          )}
          <Button
            variant={anyOn ? "danger" : "primary"}
            onClick={() => validate() && setConfirming(true)}
          >
            {anyOn ? "Aplicar mantenimiento" : "Guardar (sin mantenimiento)"}
          </Button>
        </div>
      </Card>

      <ConfirmReasonModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={anyOn ? "Aplicar mantenimiento" : "Quitar el mantenimiento"}
        warning={
          anyOn
            ? enabled
              ? "Las organizaciones dejarán de poder usar el CRM, el bot y los envíos mientras dure."
              : "Los servicios marcados dejarán de funcionar para las organizaciones mientras dure."
            : "Todo volverá a la normalidad de inmediato."
        }
        confirmLabel={anyOn ? "Aplicar" : "Guardar"}
        danger={anyOn}
        onConfirm={(reason) =>
          mutation.mutateAsync({
            reason,
            enabled,
            services: Object.fromEntries(
              Object.entries(services).filter(([, on]) => on),
            ),
            starts_at: fromLocalInput(startsAt),
            ends_at: fromLocalInput(endsAt),
            message: message.trim() || null,
          })
        }
      />
    </div>
  );
}
