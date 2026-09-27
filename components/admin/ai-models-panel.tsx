"use client";

import { ReasonField, REASON_MIN } from "@/components/admin/reason-field";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  Spinner,
} from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";
import {
  useAdminAiModels,
  useCreateAiModel,
  useUpdateAiModel,
} from "@/lib/hooks/admin-catalog";
import { formatUsd } from "@/lib/utils";

type AIModel = components["schemas"]["AIModelOut"];

const DECIMAL = /^\d+(\.\d+)?$/;

function perMillion(perToken: string): string {
  return formatUsd(Number(perToken) * 1_000_000);
}

export function AiModelsPanel() {
  const { data, isLoading, error } = useAdminAiModels();
  const [editing, setEditing] = useState<AIModel | "new" | null>(null);

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Catálogo de modelos
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Los precios alimentan el costo estimado de cada sesión de IA.
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>Nuevo modelo</Button>
      </div>

      {isLoading && <Spinner />}
      {error && (
        <ErrorBanner message="No se pudo cargar el catálogo de modelos." />
      )}

      {data && (
        <Card className="overflow-x-auto">
          {data.length === 0 ? (
            <EmptyState title="Aún no hay modelos en el catálogo." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-3 font-medium">Modelo</th>
                  <th className="px-4 py-3 font-medium">Proveedor</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Entrada / 1M tok
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Salida / 1M tok
                  </th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.map((model) => (
                  <tr
                    key={model.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{model.display_name}</div>
                      <div className="font-mono text-xs text-zinc-500">
                        {model.model_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">{model.provider}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {perMillion(model.input_price_per_token)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {perMillion(model.output_price_per_token)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={model.is_active ? "green" : "neutral"}>
                        {model.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditing(model)}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {editing && (
        <ModelForm
          key={editing === "new" ? "new" : editing.id}
          model={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function ModelForm({
  model,
  onClose,
}: {
  model: AIModel | null;
  onClose: () => void;
}) {
  const create = useCreateAiModel();
  const update = useUpdateAiModel(model?.id ?? "");
  const [provider, setProvider] = useState(model?.provider ?? "");
  const [modelName, setModelName] = useState(model?.model_name ?? "");
  const [displayName, setDisplayName] = useState(model?.display_name ?? "");
  const [inputPrice, setInputPrice] = useState(
    model?.input_price_per_token ?? "0",
  );
  const [outputPrice, setOutputPrice] = useState(
    model?.output_price_per_token ?? "0",
  );
  const [isActive, setIsActive] = useState(model?.is_active ?? true);
  const [capabilities, setCapabilities] = useState(() =>
    JSON.stringify(model?.capabilities ?? {}, null, 2),
  );
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (reason.trim().length < REASON_MIN)
      return setError("Escribe el motivo del cambio (mínimo 3 caracteres).");
    if (!displayName.trim())
      return setError("El nombre visible es obligatorio.");
    if (!DECIMAL.test(inputPrice) || !DECIMAL.test(outputPrice)) {
      return setError(
        "Los precios por token deben ser números ≥ 0 (p. ej. 0.0000025).",
      );
    }
    let caps: Record<string, unknown>;
    try {
      const value: unknown = JSON.parse(capabilities || "{}");
      if (typeof value !== "object" || value === null || Array.isArray(value))
        throw new Error();
      caps = value as Record<string, unknown>;
    } catch {
      return setError("Las capacidades deben ser un objeto JSON válido.");
    }
    setBusy(true);
    try {
      if (model) {
        await update.mutateAsync({
          display_name: displayName.trim(),
          is_active: isActive,
          input_price_per_token: inputPrice,
          output_price_per_token: outputPrice,
          capabilities: caps,
          reason: reason.trim(),
        });
      } else {
        if (!provider.trim() || !modelName.trim()) {
          return setError("Proveedor y nombre técnico son obligatorios.");
        }
        await create.mutateAsync({
          provider: provider.trim(),
          model_name: modelName.trim(),
          display_name: displayName.trim(),
          input_price_per_token: inputPrice,
          output_price_per_token: outputPrice,
          capabilities: caps,
          reason: reason.trim(),
        });
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar el modelo.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={model ? `Editar «${model.display_name}»` : "Nuevo modelo"}
    >
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        {error && <ErrorBanner message={error} />}
        {!model && (
          <>
            <div>
              <Label htmlFor="provider">Proveedor</Label>
              <Input
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="model-name">
                Nombre técnico (no se puede cambiar)
              </Label>
              <Input
                id="model-name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </div>
          </>
        )}
        <div>
          <Label htmlFor="display-name">Nombre visible</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="input-price">USD por token de entrada</Label>
            <Input
              id="input-price"
              inputMode="decimal"
              value={inputPrice}
              onChange={(e) => setInputPrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="output-price">USD por token de salida</Label>
            <Input
              id="output-price"
              inputMode="decimal"
              value={outputPrice}
              onChange={(e) => setOutputPrice(e.target.value)}
            />
          </div>
        </div>
        {model && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Modelo activo
          </label>
        )}
        <div>
          <Label htmlFor="capabilities">Capacidades (JSON)</Label>
          <Textarea
            id="capabilities"
            rows={3}
            className="font-mono text-xs"
            value={capabilities}
            onChange={(e) => setCapabilities(e.target.value)}
          />
        </div>
        <ReasonField value={reason} onChange={setReason} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={busy} onClick={() => void submit()}>
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
