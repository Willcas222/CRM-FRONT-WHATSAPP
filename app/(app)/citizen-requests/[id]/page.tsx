"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import {
  CITIZEN_REQUEST_STATUS_LABEL,
  CITIZEN_REQUEST_STATUS_TONE,
  CITIZEN_REQUEST_STATUSES,
  CITIZEN_REQUEST_TYPE_LABEL,
} from "@/lib/campaign-labels";
import { ApiError } from "@/lib/auth-context";
import { useContact } from "@/lib/hooks/contacts";
import {
  useChangeCitizenRequestStatus,
  useCitizenRequest,
  useCitizenRequestHistory,
  type CitizenRequestStatus,
} from "@/lib/hooks/campaign";
import { formatDateTime } from "@/lib/utils";
import { useRequireCampaignVertical } from "../../campaign/require-campaign";

export default function CitizenRequestDetailPage() {
  const isCampaign = useRequireCampaignVertical();
  const { id } = useParams<{ id: string }>();
  const request = useCitizenRequest(id);
  const history = useCitizenRequestHistory(id);
  const contact = useContact(request.data?.contact_id);

  if (!isCampaign || request.isLoading) return <FullPageSpinner />;
  if (request.error || !request.data) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <ErrorBanner message="No se encontró la solicitud." />
        <Link
          href="/citizen-requests"
          className="mt-4 inline-block text-sm text-emerald-700 dark:text-emerald-400"
        >
          ← Volver a solicitudes
        </Link>
      </div>
    );
  }

  const data = request.data;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link
        href="/citizen-requests"
        className="text-sm text-emerald-700 dark:text-emerald-400"
      >
        ← Solicitudes ciudadanas
      </Link>

      <div className="mt-2 mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {data.subject}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {data.radicado} · {CITIZEN_REQUEST_TYPE_LABEL[data.type]}
          </p>
        </div>
        <Badge tone={CITIZEN_REQUEST_STATUS_TONE[data.status]}>
          {CITIZEN_REQUEST_STATUS_LABEL[data.status]}
        </Badge>
      </div>

      <div className="space-y-6">
        <Card className="space-y-3 p-5">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Contacto
            </p>
            {contact.data ? (
              <Link
                href={`/contacts/${contact.data.id}`}
                className="text-sm font-medium text-emerald-700 dark:text-emerald-400"
              >
                {contact.data.name || contact.data.phone}
              </Link>
            ) : (
              <p className="text-sm text-zinc-400">…</p>
            )}
          </div>
          {data.description && (
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Descripción
              </p>
              <p className="text-sm whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {data.description}
              </p>
            </div>
          )}
          <p className="text-xs text-zinc-400">
            Creada el {formatDateTime(data.created_at)}
          </p>
        </Card>

        <StatusChanger requestId={data.id} currentStatus={data.status} />

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Historial
          </h2>
          {history.isLoading ? (
            <p className="text-sm text-zinc-400">Cargando…</p>
          ) : !history.data || history.data.items.length === 0 ? (
            <p className="text-sm text-zinc-400">Sin cambios todavía.</p>
          ) : (
            <ul className="space-y-3">
              {history.data.items.map((event, i) => (
                <li key={i} className="text-sm">
                  <p className="text-zinc-800 dark:text-zinc-200">
                    {event.previous_status
                      ? `${CITIZEN_REQUEST_STATUS_LABEL[event.previous_status]} → `
                      : ""}
                    <strong>
                      {CITIZEN_REQUEST_STATUS_LABEL[event.new_status]}
                    </strong>
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(event.created_at)}
                    {event.reason ? ` · ${event.reason}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatusChanger({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: CitizenRequestStatus;
}) {
  const mutation = useChangeCitizenRequestStatus(requestId);
  const [target, setTarget] = useState<CitizenRequestStatus | "">("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleChange() {
    if (!target) return;
    setError(null);
    try {
      await mutation.mutateAsync({ status: target, reason: reason || undefined });
      setTarget("");
      setReason("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cambiar el estado.");
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Cambiar estado
      </h2>
      {error && <ErrorBanner message={error} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="new-status">Nuevo estado</Label>
          <Select
            id="new-status"
            value={target}
            onChange={(e) => setTarget(e.target.value as CitizenRequestStatus | "")}
          >
            <option value="">Selecciona…</option>
            {CITIZEN_REQUEST_STATUSES.filter((s) => s !== currentStatus).map(
              (s) => (
                <option key={s} value={s}>
                  {CITIZEN_REQUEST_STATUS_LABEL[s]}
                </option>
              ),
            )}
          </Select>
        </div>
        <div>
          <Label htmlFor="reason">Motivo (opcional)</Label>
          <Textarea
            id="reason"
            rows={1}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          disabled={!target}
          loading={mutation.isPending}
          onClick={handleChange}
        >
          Guardar
        </Button>
      </div>
    </Card>
  );
}
