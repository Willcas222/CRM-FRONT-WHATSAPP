"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Badge, Card, ErrorBanner, Spinner } from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import { useBots, useUpdateBot, type UpdateBotRequest } from "@/lib/hooks/bots";
import { useInboxes } from "@/lib/hooks/inboxes";
import type { components } from "@/lib/api-schema";

type BotOut = components["schemas"]["BotOut"];

const FIELD_TYPES = ["text", "email", "phone", "number", "enum"] as const;
const FIELD_TARGETS = [
  "lead.metadata",
  "contact.name",
  "contact.email",
] as const;

const TARGET_LABELS: Record<(typeof FIELD_TARGETS)[number], string> = {
  "lead.metadata": "Dato del lead",
  "contact.name": "Nombre del contacto",
  "contact.email": "Email del contacto",
};

const requiredFieldSchema = z
  .object({
    key: z
      .string()
      .min(1, "Obligatoria.")
      .regex(
        /^[a-z][a-z0-9_]{0,39}$/,
        "Minúsculas, dígitos y `_`, debe empezar por letra (máx. 40).",
      ),
    label: z.string().min(1, "Obligatoria."),
    type: z.enum(FIELD_TYPES),
    target: z.enum(FIELD_TARGETS),
    required: z.boolean(),
    options: z.string().optional(),
  })
  .superRefine((field, ctx) => {
    if (field.target === "contact.name" && field.type !== "text") {
      ctx.addIssue({
        code: "custom",
        path: ["type"],
        message: "`Nombre del contacto` solo admite texto.",
      });
    }
    if (field.target === "contact.email" && field.type !== "email") {
      ctx.addIssue({
        code: "custom",
        path: ["type"],
        message: "`Email del contacto` solo admite email.",
      });
    }
    if (field.type === "enum" && !field.options?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Un campo de lista necesita opciones (separadas por coma).",
      });
    }
  });

const botFormSchema = z
  .object({
    is_active: z.boolean(),
    system_prompt: z.string().max(4000, "Máximo 4000 caracteres."),
    welcome_message: z.string().max(1000, "Máximo 1000 caracteres.").optional(),
    non_text_message: z
      .string()
      .max(1000, "Máximo 1000 caracteres.")
      .optional(),
    required_fields: z.array(requiredFieldSchema).max(20, "Máximo 20 campos."),
    handoff_on_qualified: z.boolean(),
    handoff_max_bot_turns: z.coerce.number().int().min(1).max(100),
    handoff_keywords: z.string().optional(),
    handoff_message: z.string().max(1000, "Máximo 1000 caracteres.").optional(),
  })
  .superRefine((values, ctx) => {
    const names = values.required_fields.filter(
      (f) => f.target === "contact.name",
    ).length;
    const emails = values.required_fields.filter(
      (f) => f.target === "contact.email",
    ).length;
    if (names > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["required_fields"],
        message: "Solo un campo puede apuntar al nombre del contacto.",
      });
    }
    if (emails > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["required_fields"],
        message: "Solo un campo puede apuntar al email del contacto.",
      });
    }
    const keys = values.required_fields.map((f) => f.key);
    if (new Set(keys).size !== keys.length) {
      ctx.addIssue({
        code: "custom",
        path: ["required_fields"],
        message: "Las claves de los campos deben ser únicas.",
      });
    }
  });

type BotFormValues = z.infer<typeof botFormSchema>;

function fromBot(bot: BotOut): BotFormValues {
  const rawFields = bot.required_fields as Array<Record<string, unknown>>;
  const rawHandoff = bot.handoff_rules as Record<string, unknown>;
  return {
    is_active: bot.is_active,
    system_prompt: bot.system_prompt,
    welcome_message: bot.welcome_message ?? "",
    non_text_message: bot.non_text_message ?? "",
    required_fields: rawFields.map((f) => ({
      key: typeof f.key === "string" ? f.key : "",
      label: typeof f.label === "string" ? f.label : "",
      type: (FIELD_TYPES as readonly string[]).includes(f.type as string)
        ? (f.type as (typeof FIELD_TYPES)[number])
        : "text",
      target: (FIELD_TARGETS as readonly string[]).includes(f.target as string)
        ? (f.target as (typeof FIELD_TARGETS)[number])
        : "lead.metadata",
      required: f.required !== false,
      options: Array.isArray(f.options)
        ? (f.options as string[]).join(", ")
        : "",
    })),
    handoff_on_qualified: rawHandoff.on_qualified !== false,
    handoff_max_bot_turns:
      typeof rawHandoff.max_bot_turns === "number"
        ? rawHandoff.max_bot_turns
        : 12,
    handoff_keywords: Array.isArray(rawHandoff.keywords)
      ? (rawHandoff.keywords as string[]).join(", ")
      : "",
    handoff_message:
      typeof rawHandoff.handoff_message === "string"
        ? rawHandoff.handoff_message
        : "",
  };
}

function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toRequest(values: BotFormValues): UpdateBotRequest {
  return {
    is_active: values.is_active,
    system_prompt: values.system_prompt,
    welcome_message: values.welcome_message?.trim() || null,
    non_text_message: values.non_text_message?.trim() || null,
    required_fields: values.required_fields.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      target: f.target,
      required: f.required,
      ...(f.type === "enum" ? { options: splitList(f.options) } : {}),
    })),
    handoff_rules: {
      on_qualified: values.handoff_on_qualified,
      max_bot_turns: values.handoff_max_bot_turns,
      keywords: splitList(values.handoff_keywords),
      handoff_message: values.handoff_message?.trim() || null,
    },
  };
}

export function BotTab() {
  const { data: bots, isLoading } = useBots();
  const { data: inboxes } = useInboxes();
  const [openId, setOpenId] = useState<string | null>(null);

  function inboxName(inboxId: string) {
    return inboxes?.items.find((i) => i.id === inboxId)?.name ?? inboxId;
  }

  return (
    <div className="space-y-4">
      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !bots || bots.items.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500 dark:text-zinc-400">
            No hay bots todavía: crea un canal de WhatsApp en la pestaña
            «Canales» primero.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {bots.items.map((bot) => (
              <li key={bot.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(openId === bot.id ? null : bot.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {inboxName(bot.inbox_id)}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge tone={bot.is_active ? "green" : "neutral"}>
                      {bot.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                    <span className="text-xs text-zinc-400">
                      {openId === bot.id ? "Ocultar" : "Configurar"}
                    </span>
                  </div>
                </button>
                {openId === bot.id && (
                  <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
                    <BotForm bot={bot} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function BotForm({ bot }: { bot: BotOut }) {
  const updateBot = useUpdateBot(bot.id);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BotFormValues>({
    // El esquema combina un arreglo con `superRefine` por elemento y otro a nivel de formulario;
    // TypeScript no logra unificar el tipo `Resolver<T>` resultante sin esta anotación explícita.
    resolver: zodResolver(botFormSchema) as Resolver<BotFormValues>,
    defaultValues: fromBot(bot),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "required_fields",
  });

  async function onSubmit(values: BotFormValues) {
    setError(null);
    setSaved(false);
    try {
      const updated = await updateBot.mutateAsync(toRequest(values));
      // Sin este `reset`, `isDirty` se queda en `true` para siempre tras el primer cambio
      // (react-hook-form no lo limpia solo al guardar) y el aviso de "Guardado" nunca aparece.
      reset(fromBot(updated));
      setSaved(true);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "No se pudo guardar la configuración del bot.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && <ErrorBanner message={error} />}
      {saved && !isDirty && (
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Guardado.
        </p>
      )}

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Bot activo
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Responde automáticamente los mensajes entrantes de este canal.
          </p>
        </div>
        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            {...register("is_active")}
          />
          <div className="relative h-6 w-11 rounded-full bg-zinc-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-5 dark:bg-zinc-700" />
        </label>
      </div>

      <div>
        <Label htmlFor={`${bot.id}-system_prompt`}>
          Instrucciones del bot (system prompt)
        </Label>
        <Textarea
          id={`${bot.id}-system_prompt`}
          rows={5}
          error={errors.system_prompt?.message}
          {...register("system_prompt")}
        />
      </div>

      <div>
        <Label htmlFor={`${bot.id}-welcome_message`}>
          Mensaje de bienvenida (opcional)
        </Label>
        <Textarea
          id={`${bot.id}-welcome_message`}
          rows={2}
          placeholder="Se envía en el primer mensaje del bot."
          error={errors.welcome_message?.message}
          {...register("welcome_message")}
        />
      </div>

      <div>
        <Label htmlFor={`${bot.id}-non_text_message`}>
          Mensaje para contenido no soportado (opcional)
        </Label>
        <Textarea
          id={`${bot.id}-non_text_message`}
          rows={2}
          placeholder="Por ahora solo puedo leer mensajes de texto. ¿Puedes escribirme tu consulta?"
          error={errors.non_text_message?.message}
          {...register("non_text_message")}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="mb-0">Datos que debe reunir el bot</Label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              append({
                key: "",
                label: "",
                type: "text",
                target: "lead.metadata",
                required: true,
                options: "",
              })
            }
          >
            Añadir campo
          </Button>
        </div>
        {errors.required_fields?.root?.message && (
          <p className="mb-2 text-xs text-red-600 dark:text-red-400">
            {errors.required_fields.root.message}
          </p>
        )}
        {fields.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Sin campos configurados.
          </p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <RequiredFieldRow
                key={field.id}
                index={index}
                control={control}
                register={register}
                errors={errors}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Reglas de traspaso a una persona
        </p>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" {...register("handoff_on_qualified")} />
          Pasar a una persona automáticamente cuando el lead quede calificado
        </label>
        <div>
          <Label htmlFor={`${bot.id}-max_turns`}>
            Máximo de turnos del bot antes de pasar a una persona
          </Label>
          <Input
            id={`${bot.id}-max_turns`}
            type="number"
            min={1}
            max={100}
            error={errors.handoff_max_bot_turns?.message}
            {...register("handoff_max_bot_turns")}
          />
        </div>
        <div>
          <Label htmlFor={`${bot.id}-keywords`}>
            Palabras clave que piden un agente (separadas por coma)
          </Label>
          <Input
            id={`${bot.id}-keywords`}
            placeholder="asesor, humano, persona"
            {...register("handoff_keywords")}
          />
        </div>
        <div>
          <Label htmlFor={`${bot.id}-handoff_message`}>
            Mensaje al pasar a una persona (opcional)
          </Label>
          <Textarea
            id={`${bot.id}-handoff_message`}
            rows={2}
            error={errors.handoff_message?.message}
            {...register("handoff_message")}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}

function RequiredFieldRow({
  index,
  control,
  register,
  errors,
  onRemove,
}: {
  index: number;
  control: Control<BotFormValues>;
  register: UseFormRegister<BotFormValues>;
  errors: FieldErrors<BotFormValues>;
  onRemove: () => void;
}) {
  const type = useWatch({ control, name: `required_fields.${index}.type` });
  const fieldErrors = errors.required_fields?.[index];

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700 sm:grid-cols-6">
      <div className="col-span-2 sm:col-span-1">
        <Label className="text-xs">Clave</Label>
        <Input
          error={fieldErrors?.key?.message}
          {...register(`required_fields.${index}.key`)}
        />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <Label className="text-xs">Etiqueta</Label>
        <Input
          error={fieldErrors?.label?.message}
          {...register(`required_fields.${index}.label`)}
        />
      </div>
      <div className="col-span-1">
        <Label className="text-xs">Destino</Label>
        <Select {...register(`required_fields.${index}.target`)}>
          {FIELD_TARGETS.map((t) => (
            <option key={t} value={t}>
              {TARGET_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>
      <div className="col-span-1">
        <Label className="text-xs">Tipo</Label>
        <Select
          error={fieldErrors?.type?.message}
          {...register(`required_fields.${index}.type`)}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>
      {type === "enum" && (
        <div className="col-span-2 sm:col-span-1">
          <Label className="text-xs">Opciones (coma)</Label>
          <Input
            error={fieldErrors?.options?.message}
            {...register(`required_fields.${index}.options`)}
          />
        </div>
      )}
      <div className="col-span-2 flex items-end justify-between gap-2 sm:col-span-1">
        <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            {...register(`required_fields.${index}.required`)}
          />
          Obligatorio
        </label>
        <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
          Quitar
        </Button>
      </div>
    </div>
  );
}
