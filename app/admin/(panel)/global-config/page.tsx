"use client";

import { useState } from "react";

import { ConfirmReasonModal } from "@/components/admin/confirm-reason-modal";
import {
  draftToLimits,
  LimitsEditor,
  limitsToDraft,
  type LimitDraft,
} from "@/components/admin/limits-editor";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { Card, ErrorBanner, FullPageSpinner } from "@/components/ui/misc";
import type { components } from "@/lib/api-schema";
import { useAdminAiModels } from "@/lib/hooks/admin-catalog";
import {
  useGlobalConfig,
  useUpdateGlobalConfig,
} from "@/lib/hooks/admin-settings";
import { formatDateTime } from "@/lib/utils";

type Item = components["schemas"]["ConfigItemOut"];

const TITLES: Record<string, string> = {
  default_limits: "Límites por defecto",
  default_ai_model: "Modelo de IA por defecto",
  fallback_ai_model: "Modelo de IA de respaldo",
  maintenance_message: "Mensaje de mantenimiento",
};

export default function AdminGlobalConfigPage() {
  const { data, isLoading, error } = useGlobalConfig();

  return (
    <>
      <PageHeader
        title="Configuración global"
        help="global-config"
        description="Valores no sensibles que aplican a toda la plataforma. Los secretos nunca se muestran ni se guardan aquí."
      />
      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudo cargar la configuración." />}
      {data && (
        <div className="space-y-6">
          {data.items.map((item) => (
            <ConfigCard key={`${item.key}-${item.updated_at}`} item={item} />
          ))}
        </div>
      )}
    </>
  );
}

function ConfigCard({ item }: { item: Item }) {
  const mutation = useUpdateGlobalConfig();
  const models = useAdminAiModels();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<LimitDraft>(() =>
    limitsToDraft(
      (item.value ?? undefined) as Record<string, unknown> | undefined,
    ),
  );
  const [text, setText] = useState(
    typeof item.value === "string" ? item.value : "",
  );

  function build(): unknown | undefined {
    setError(null);
    if (item.key === "default_limits") {
      const { limits, error: limitError } = draftToLimits(draft);
      if (limitError) {
        setError(limitError);
        return undefined;
      }
      return Object.keys(limits).length > 0 ? limits : null;
    }
    return text.trim() ? text.trim() : null;
  }

  const modelNames = models.data?.map((m) => m.model_name) ?? [];

  return (
    <Card className="space-y-4 p-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {TITLES[item.key] ?? item.key}
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {item.description}
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
          {item.key}
          {item.updated_at
            ? ` · actualizado ${formatDateTime(item.updated_at)}`
            : " · sin definir"}
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      {item.key === "default_limits" && (
        <LimitsEditor
          draft={draft}
          onChange={setDraft}
          emptyMeaning="sin límite global"
        />
      )}
      {(item.key === "default_ai_model" ||
        item.key === "fallback_ai_model") && (
        <Select value={text} onChange={(event) => setText(event.target.value)}>
          <option value="">(sin valor)</option>
          {text && !modelNames.includes(text) && (
            <option value={text}>{text}</option>
          )}
          {modelNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      )}
      {item.key === "maintenance_message" && (
        <Textarea
          rows={2}
          maxLength={500}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => {
            if (build() !== undefined) setConfirming(true);
          }}
        >
          Guardar
        </Button>
      </div>

      <ConfirmReasonModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Cambiar «${TITLES[item.key] ?? item.key}»`}
        warning="Este valor aplica a toda la plataforma. Vaciarlo lo quita y vuelve al comportamiento por defecto."
        confirmLabel="Guardar cambio"
        onConfirm={(reason) => {
          const value = build();
          return mutation.mutateAsync({
            values: { [item.key]: value ?? null },
            reason,
          });
        }}
      />
    </Card>
  );
}
