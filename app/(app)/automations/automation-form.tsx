"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type Resolver,
  type UseFormRegister,
} from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, ErrorBanner } from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import { useCreateAutomation, useReplaceAutomation, type CreateAutomationRequest } from "@/lib/hooks/automations";
import { usePipelines } from "@/lib/hooks/pipelines";
import { useUsers } from "@/lib/hooks/users";
import type { components } from "@/lib/api-schema";

type AutomationOut = components["schemas"]["AutomationOut"];

const TRIGGER_TYPES = [
  "NEW_CONTACT",
  "NEW_LEAD",
  "MESSAGE_RECEIVED",
  "STAGE_CHANGED",
  "LEAD_QUALIFIED",
  "TIME_ELAPSED",
] as const;

const TRIGGER_LABELS: Record<(typeof TRIGGER_TYPES)[number], string> = {
  NEW_CONTACT: "Nuevo contacto",
  NEW_LEAD: "Nuevo lead",
  MESSAGE_RECEIVED: "Mensaje recibido",
  STAGE_CHANGED: "Cambio de etapa",
  LEAD_QUALIFIED: "Lead calificado",
  TIME_ELAPSED: "Tiempo transcurrido",
};

const TIME_REFERENCES = ["LAST_INBOUND", "STAGE_ENTERED"] as const;
const TIME_REFERENCE_LABELS: Record<(typeof TIME_REFERENCES)[number], string> = {
  LAST_INBOUND: "Desde el último mensaje del cliente",
  STAGE_ENTERED: "Desde que el lead entró a la etapa actual",
};

const TIME_UNITS = ["minutes", "hours", "days"] as const;
const TIME_UNIT_SECONDS: Record<(typeof TIME_UNITS)[number], number> = {
  minutes: 60,
  hours: 3600,
  days: 86400,
};
const TIME_UNIT_LABELS: Record<(typeof TIME_UNITS)[number], string> = {
  minutes: "minutos",
  hours: "horas",
  days: "días",
};

const CONDITION_FIELDS = [
  "contact.name",
  "contact.email",
  "contact.phone",
  "lead.stage_id",
  "lead.status",
  "lead.source",
  "lead.metadata",
] as const;
const CONDITION_FIELD_LABELS: Record<(typeof CONDITION_FIELDS)[number], string> = {
  "contact.name": "Nombre del contacto",
  "contact.email": "Email del contacto",
  "contact.phone": "Teléfono del contacto",
  "lead.stage_id": "Etapa del lead",
  "lead.status": "Estado del lead",
  "lead.source": "Origen del lead",
  "lead.metadata": "Dato del lead (personalizado)",
};

const LEAD_STATUSES = ["BOT_ACTIVE", "HUMAN_PENDING", "HUMAN_ASSIGNED", "CLOSED_WON", "CLOSED_LOST"] as const;
const LEAD_SOURCES = ["WHATSAPP", "MANUAL", "AUTOMATION", "API"] as const;

const CONDITION_OPS = ["eq", "neq", "in", "gt", "lt", "contains", "exists", "not_exists"] as const;
const CONDITION_OP_LABELS: Record<(typeof CONDITION_OPS)[number], string> = {
  eq: "es igual a",
  neq: "es distinto de",
  in: "está en la lista",
  gt: "es mayor que",
  lt: "es menor que",
  contains: "contiene",
  exists: "tiene un valor",
  not_exists: "no tiene valor",
};
const NO_VALUE_OPS = new Set<(typeof CONDITION_OPS)[number]>(["exists", "not_exists"]);

const ACTION_TYPES = [
  "SEND_WHATSAPP",
  "RUN_AI",
  "CHANGE_STAGE",
  "ASSIGN_AGENT",
  "CREATE_TASK",
  "HANDOFF",
  "WEBHOOK",
] as const;
const ACTION_LABELS: Record<(typeof ACTION_TYPES)[number], string> = {
  SEND_WHATSAPP: "Enviar WhatsApp",
  RUN_AI: "Ejecutar la IA",
  CHANGE_STAGE: "Cambiar de etapa",
  ASSIGN_AGENT: "Asignar agente",
  CREATE_TASK: "Crear tarea",
  HANDOFF: "Pasar a una persona",
  WEBHOOK: "Llamar un webhook",
};

const conditionSchema = z
  .object({
    fieldGroup: z.enum(CONDITION_FIELDS),
    metadataKey: z.string().optional(),
    op: z.enum(CONDITION_OPS),
    value: z.string().optional(),
  })
  .superRefine((c, ctx) => {
    if (c.fieldGroup === "lead.metadata" && !c.metadataKey?.trim()) {
      ctx.addIssue({ code: "custom", path: ["metadataKey"], message: "Escribe la clave del dato del lead." });
    }
    if (!NO_VALUE_OPS.has(c.op) && !c.value?.trim()) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Obligatorio para este operador." });
    }
  });

const stepSchema = z
  .object({
    action_type: z.enum(ACTION_TYPES),
    text: z.string().optional(),
    stage_id: z.string().optional(),
    agent_id: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    due_in_hours: z.string().optional(),
    reason: z.string().optional(),
    url: z.string().optional(),
    secret: z.string().optional(),
  })
  .superRefine((s, ctx) => {
    if (s.action_type === "SEND_WHATSAPP" && !s.text?.trim()) {
      ctx.addIssue({ code: "custom", path: ["text"], message: "Escribe el mensaje a enviar." });
    }
    if (s.action_type === "CHANGE_STAGE" && !s.stage_id) {
      ctx.addIssue({ code: "custom", path: ["stage_id"], message: "Selecciona una etapa." });
    }
    if (s.action_type === "CREATE_TASK" && !s.title?.trim()) {
      ctx.addIssue({ code: "custom", path: ["title"], message: "Escribe un título." });
    }
    if (s.action_type === "CREATE_TASK" && s.due_in_hours && !/^\d+$/.test(s.due_in_hours)) {
      ctx.addIssue({ code: "custom", path: ["due_in_hours"], message: "Debe ser un número entero de horas." });
    }
    if (s.action_type === "WEBHOOK" && !s.url?.trim().startsWith("https://")) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "Debe ser una URL https:// válida." });
    }
  });

const automationFormSchema = z
  .object({
    name: z.string().min(1, "Obligatorio.").max(200, "Máximo 200 caracteres."),
    description: z.string().max(1000, "Máximo 1000 caracteres.").optional(),
    trigger_type: z.enum(TRIGGER_TYPES),
    stage_changed_to_stage_id: z.string().optional(),
    time_reference: z.enum(TIME_REFERENCES).optional(),
    time_value: z.coerce.number().optional(),
    time_unit: z.enum(TIME_UNITS).optional(),
    conditions: z.array(conditionSchema).max(10, "Máximo 10 condiciones."),
    steps: z.array(stepSchema).min(1, "Debe tener al menos un paso.").max(10, "Máximo 10 pasos."),
  })
  .superRefine((values, ctx) => {
    if (values.trigger_type === "TIME_ELAPSED") {
      const seconds = Math.round((values.time_value ?? 0) * TIME_UNIT_SECONDS[values.time_unit ?? "minutes"]);
      if (!values.time_value || seconds < 60 || seconds > 60 * 60 * 24 * 30) {
        ctx.addIssue({
          code: "custom",
          path: ["time_value"],
          message: "Debe estar entre 1 minuto y 30 días.",
        });
      }
    }
  });

type AutomationFormValues = z.infer<typeof automationFormSchema>;

function emptyAutomation(): AutomationFormValues {
  return {
    name: "",
    description: "",
    trigger_type: "NEW_CONTACT",
    stage_changed_to_stage_id: "",
    time_reference: "LAST_INBOUND",
    time_value: 30,
    time_unit: "minutes",
    conditions: [],
    steps: [
      {
        action_type: "SEND_WHATSAPP",
        text: "",
        stage_id: "",
        agent_id: "",
        title: "",
        description: "",
        due_in_hours: "",
        reason: "",
        url: "",
        secret: "",
      },
    ],
  };
}

function secondsToValueUnit(seconds: number): { value: number; unit: (typeof TIME_UNITS)[number] } {
  if (seconds % 86400 === 0) return { value: seconds / 86400, unit: "days" };
  if (seconds % 3600 === 0) return { value: seconds / 3600, unit: "hours" };
  return { value: Math.round(seconds / 60), unit: "minutes" };
}

function fromAutomation(a: AutomationOut): AutomationFormValues {
  const cfg = a.trigger_config as Record<string, unknown>;
  const timing =
    typeof cfg.after_seconds === "number" ? secondsToValueUnit(cfg.after_seconds) : { value: 30, unit: "minutes" as const };
  return {
    name: a.name,
    description: a.description ?? "",
    trigger_type: (TRIGGER_TYPES as readonly string[]).includes(a.trigger_type)
      ? (a.trigger_type as (typeof TRIGGER_TYPES)[number])
      : "NEW_CONTACT",
    stage_changed_to_stage_id: typeof cfg.to_stage_id === "string" ? cfg.to_stage_id : "",
    time_reference: (TIME_REFERENCES as readonly string[]).includes(cfg.reference as string)
      ? (cfg.reference as (typeof TIME_REFERENCES)[number])
      : "LAST_INBOUND",
    time_value: timing.value,
    time_unit: timing.unit,
    conditions: a.conditions.map((c) => {
      const isMetadata = c.field.startsWith("lead.metadata.");
      const fieldGroup = isMetadata
        ? ("lead.metadata" as const)
        : (CONDITION_FIELDS as readonly string[]).includes(c.field)
          ? (c.field as (typeof CONDITION_FIELDS)[number])
          : ("lead.metadata" as const);
      return {
        fieldGroup,
        metadataKey: isMetadata ? c.field.slice("lead.metadata.".length) : "",
        op: (CONDITION_OPS as readonly string[]).includes(c.op) ? (c.op as (typeof CONDITION_OPS)[number]) : "eq",
        value: Array.isArray(c.value) ? c.value.join(", ") : c.value != null ? String(c.value) : "",
      };
    }),
    steps: a.steps.map((s) => {
      const config = s.config as Record<string, unknown>;
      return {
        action_type: (ACTION_TYPES as readonly string[]).includes(s.action_type)
          ? (s.action_type as (typeof ACTION_TYPES)[number])
          : "SEND_WHATSAPP",
        text: typeof config.text === "string" ? config.text : "",
        stage_id: typeof config.stage_id === "string" ? config.stage_id : "",
        agent_id: typeof config.agent_id === "string" ? config.agent_id : "",
        title: typeof config.title === "string" ? config.title : "",
        description: typeof config.description === "string" ? config.description : "",
        due_in_hours: typeof config.due_in_hours === "number" ? String(config.due_in_hours) : "",
        reason: typeof config.reason === "string" ? config.reason : "",
        url: typeof config.url === "string" ? config.url : "",
        secret: typeof config.secret === "string" ? config.secret : "",
      };
    }),
  };
}

function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toRequest(values: AutomationFormValues): CreateAutomationRequest {
  let trigger_config: Record<string, unknown> = {};
  if (values.trigger_type === "STAGE_CHANGED" && values.stage_changed_to_stage_id) {
    trigger_config = { to_stage_id: values.stage_changed_to_stage_id };
  } else if (values.trigger_type === "TIME_ELAPSED") {
    trigger_config = {
      reference: values.time_reference,
      after_seconds: Math.round((values.time_value ?? 0) * TIME_UNIT_SECONDS[values.time_unit ?? "minutes"]),
    };
  }

  const conditions = values.conditions.map((c) => {
    const field = c.fieldGroup === "lead.metadata" ? `lead.metadata.${c.metadataKey!.trim()}` : c.fieldGroup;
    if (NO_VALUE_OPS.has(c.op)) return { field, op: c.op };
    if (c.op === "in") return { field, op: c.op, value: splitList(c.value) };
    return { field, op: c.op, value: c.value };
  });

  const steps = values.steps.map((s) => {
    switch (s.action_type) {
      case "SEND_WHATSAPP":
        return { action_type: s.action_type, config: { text: s.text } };
      case "CHANGE_STAGE":
        return { action_type: s.action_type, config: { stage_id: s.stage_id } };
      case "ASSIGN_AGENT":
        return { action_type: s.action_type, config: s.agent_id ? { agent_id: s.agent_id } : {} };
      case "CREATE_TASK":
        return {
          action_type: s.action_type,
          config: {
            title: s.title,
            ...(s.description?.trim() ? { description: s.description.trim() } : {}),
            ...(s.due_in_hours ? { due_in_hours: Number(s.due_in_hours) } : {}),
          },
        };
      case "HANDOFF":
        return { action_type: s.action_type, config: s.reason?.trim() ? { reason: s.reason.trim() } : {} };
      case "WEBHOOK":
        return {
          action_type: s.action_type,
          config: { url: s.url, ...(s.secret?.trim() ? { secret: s.secret.trim() } : {}) },
        };
      case "RUN_AI":
        return { action_type: s.action_type, config: {} };
    }
  });

  return {
    name: values.name,
    description: values.description?.trim() || null,
    trigger_type: values.trigger_type,
    trigger_config,
    conditions,
    steps,
    // Al crear, nace inactiva (igual que el default del backend); `PUT` la ignora — la
    // activación es un paso aparte desde la lista (`PATCH`, ver `page.tsx`).
    is_active: false,
  };
}

export function AutomationForm({ automation }: { automation?: AutomationOut }) {
  const router = useRouter();
  const createAutomation = useCreateAutomation();
  const replaceAutomation = useReplaceAutomation(automation?.id ?? "");
  const { data: pipelines } = usePipelines();
  const { data: users } = useUsers();
  const [error, setError] = useState<string | null>(null);

  const stages = pipelines?.items.flatMap((p) => p.stages.map((s) => ({ ...s, pipelineName: p.name }))) ?? [];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AutomationFormValues>({
    // El esquema combina arreglos con `superRefine` por elemento y otro a nivel de formulario;
    // TypeScript no logra unificar el tipo `Resolver<T>` resultante sin esta anotación explícita.
    resolver: zodResolver(automationFormSchema) as Resolver<AutomationFormValues>,
    defaultValues: automation ? fromAutomation(automation) : emptyAutomation(),
  });
  const triggerType = useWatch({ control, name: "trigger_type" });
  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({ control, name: "conditions" });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: "steps" });

  async function onSubmit(values: AutomationFormValues) {
    setError(null);
    try {
      const body = toRequest(values);
      if (automation) {
        await replaceAutomation.mutateAsync(body);
      } else {
        await createAutomation.mutateAsync(body);
      }
      router.push("/automations");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar la automatización.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && <ErrorBanner message={error} />}

      <Card className="space-y-4 p-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" error={errors.name?.message} {...register("name")} />
        </div>
        <div>
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea id="description" rows={2} error={errors.description?.message} {...register("description")} />
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Disparador</p>
        <div>
          <Label htmlFor="trigger_type">Cuándo se ejecuta</Label>
          <Select id="trigger_type" {...register("trigger_type")}>
            {TRIGGER_TYPES.map((t) => (
              <option key={t} value={t}>
                {TRIGGER_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        {triggerType === "STAGE_CHANGED" && (
          <div>
            <Label htmlFor="stage_changed_to_stage_id">Solo al entrar a esta etapa (opcional)</Label>
            <Select id="stage_changed_to_stage_id" {...register("stage_changed_to_stage_id")}>
              <option value="">Cualquier etapa</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.pipelineName} · {s.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        {triggerType === "TIME_ELAPSED" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Label htmlFor="time_reference">A partir de</Label>
              <Select id="time_reference" {...register("time_reference")}>
                {TIME_REFERENCES.map((r) => (
                  <option key={r} value={r}>
                    {TIME_REFERENCE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="time_value">Tiempo</Label>
              <Input
                id="time_value"
                type="number"
                min={1}
                error={errors.time_value?.message}
                {...register("time_value")}
              />
            </div>
            <div>
              <Label htmlFor="time_unit">Unidad</Label>
              <Select id="time_unit" {...register("time_unit")}>
                {TIME_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {TIME_UNIT_LABELS[u]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Condiciones <span className="font-normal text-zinc-500 dark:text-zinc-400">(todas deben cumplirse)</span>
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              appendCondition({ fieldGroup: "lead.status", metadataKey: "", op: "eq", value: "" })
            }
          >
            Añadir condición
          </Button>
        </div>
        {conditionFields.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Sin condiciones: la automatización se ejecuta siempre que ocurra el disparador.
          </p>
        ) : (
          <div className="space-y-3">
            {conditionFields.map((field, index) => (
              <ConditionRow
                key={field.id}
                index={index}
                control={control}
                register={register}
                errors={errors}
                onRemove={() => removeCondition(index)}
              />
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Pasos</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              appendStep({
                action_type: "SEND_WHATSAPP",
                text: "",
                stage_id: "",
                agent_id: "",
                title: "",
                description: "",
                due_in_hours: "",
                reason: "",
                url: "",
                secret: "",
              })
            }
          >
            Añadir paso
          </Button>
        </div>
        {errors.steps?.root?.message && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.steps.root.message}</p>
        )}
        <div className="space-y-3">
          {stepFields.map((field, index) => (
            <StepRow
              key={field.id}
              index={index}
              control={control}
              register={register}
              errors={errors}
              stages={stages}
              users={users?.items ?? []}
              onRemove={() => removeStep(index)}
              removable={stepFields.length > 1}
            />
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.push("/automations")}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

function ConditionRow({
  index,
  control,
  register,
  errors,
  onRemove,
}: {
  index: number;
  control: Control<AutomationFormValues>;
  register: UseFormRegister<AutomationFormValues>;
  errors: FieldErrors<AutomationFormValues>;
  onRemove: () => void;
}) {
  const fieldGroup = useWatch({ control, name: `conditions.${index}.fieldGroup` });
  const op = useWatch({ control, name: `conditions.${index}.op` });
  const fieldErrors = errors.conditions?.[index];

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700 sm:grid-cols-5">
      <div className="col-span-2 sm:col-span-1">
        <Label className="text-xs">Campo</Label>
        <Select {...register(`conditions.${index}.fieldGroup`)}>
          {CONDITION_FIELDS.map((f) => (
            <option key={f} value={f}>
              {CONDITION_FIELD_LABELS[f]}
            </option>
          ))}
        </Select>
      </div>
      {fieldGroup === "lead.metadata" && (
        <div className="col-span-2 sm:col-span-1">
          <Label className="text-xs">Clave del dato</Label>
          <Input
            error={fieldErrors?.metadataKey?.message}
            {...register(`conditions.${index}.metadataKey`)}
          />
        </div>
      )}
      <div className={fieldGroup === "lead.status" ? "col-span-2 sm:col-span-1" : "col-span-1"}>
        <Label className="text-xs">Operador</Label>
        <Select {...register(`conditions.${index}.op`)}>
          {CONDITION_OPS.map((o) => (
            <option key={o} value={o}>
              {CONDITION_OP_LABELS[o]}
            </option>
          ))}
        </Select>
      </div>
      {!NO_VALUE_OPS.has(op) &&
        (fieldGroup === "lead.status" ? (
          <div className="col-span-2 sm:col-span-1">
            <Label className="text-xs">Valor</Label>
            <Select error={fieldErrors?.value?.message} {...register(`conditions.${index}.value`)}>
              <option value="">—</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        ) : fieldGroup === "lead.source" ? (
          <div className="col-span-2 sm:col-span-1">
            <Label className="text-xs">Valor</Label>
            <Select error={fieldErrors?.value?.message} {...register(`conditions.${index}.value`)}>
              <option value="">—</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="col-span-2 sm:col-span-1">
            <Label className="text-xs">{op === "in" ? "Valores (coma)" : "Valor"}</Label>
            <Input error={fieldErrors?.value?.message} {...register(`conditions.${index}.value`)} />
          </div>
        ))}
      <div className="col-span-2 flex items-end justify-end sm:col-span-1">
        <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
          Quitar
        </Button>
      </div>
    </div>
  );
}

function StepRow({
  index,
  control,
  register,
  errors,
  stages,
  users,
  onRemove,
  removable,
}: {
  index: number;
  control: Control<AutomationFormValues>;
  register: UseFormRegister<AutomationFormValues>;
  errors: FieldErrors<AutomationFormValues>;
  stages: { id: string; name: string; pipelineName: string }[];
  users: { id: string; name: string }[];
  onRemove: () => void;
  removable: boolean;
}) {
  const actionType = useWatch({ control, name: `steps.${index}.action_type` });
  const fieldErrors = errors.steps?.[index];

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Label className="text-xs">Acción</Label>
          <Select {...register(`steps.${index}.action_type`)}>
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>
                {ACTION_LABELS[a]}
              </option>
            ))}
          </Select>
        </div>
        {removable && (
          <Button type="button" size="sm" variant="ghost" onClick={onRemove} className="mt-5">
            Quitar
          </Button>
        )}
      </div>

      {actionType === "SEND_WHATSAPP" && (
        <div>
          <Label className="text-xs">Mensaje</Label>
          <Textarea rows={3} error={fieldErrors?.text?.message} {...register(`steps.${index}.text`)} />
        </div>
      )}

      {actionType === "CHANGE_STAGE" && (
        <div>
          <Label className="text-xs">Nueva etapa</Label>
          <Select error={fieldErrors?.stage_id?.message} {...register(`steps.${index}.stage_id`)}>
            <option value="">Selecciona una etapa…</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.pipelineName} · {s.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {actionType === "ASSIGN_AGENT" && (
        <div>
          <Label className="text-xs">Agente</Label>
          <Select {...register(`steps.${index}.agent_id`)}>
            <option value="">Sin asignar (quitar agente)</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {actionType === "CREATE_TASK" && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Título</Label>
            <Input error={fieldErrors?.title?.message} {...register(`steps.${index}.title`)} />
          </div>
          <div>
            <Label className="text-xs">Descripción (opcional)</Label>
            <Textarea rows={2} {...register(`steps.${index}.description`)} />
          </div>
          <div>
            <Label className="text-xs">Vence en (horas, opcional)</Label>
            <Input error={fieldErrors?.due_in_hours?.message} {...register(`steps.${index}.due_in_hours`)} />
          </div>
        </div>
      )}

      {actionType === "HANDOFF" && (
        <div>
          <Label className="text-xs">Motivo (opcional)</Label>
          <Input {...register(`steps.${index}.reason`)} />
        </div>
      )}

      {actionType === "WEBHOOK" && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">URL (https://)</Label>
            <Input error={fieldErrors?.url?.message} {...register(`steps.${index}.url`)} />
          </div>
          <div>
            <Label className="text-xs">Secreto para firmar la petición (opcional)</Label>
            <Input {...register(`steps.${index}.secret`)} />
          </div>
        </div>
      )}

      {actionType === "RUN_AI" && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Ejecuta la IA del bot del canal para que continúe la conversación con el lead.
        </p>
      )}
    </div>
  );
}
