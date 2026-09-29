"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, ErrorBanner, FullPageSpinner } from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import {
  useBranding,
  useUpdateBranding,
  useUploadBrandingChatBackground,
  useUploadBrandingFavicon,
  useUploadBrandingLogo,
  type BrandingOut,
  type ChatBackgroundType,
} from "@/lib/hooks/branding";

const HEX = /^#[0-9A-Fa-f]{6}$/;
const CHAT_BG_TYPES: ChatBackgroundType[] = ["COLOR", "PATRON", "IMAGEN"];
const CHAT_BG_LABELS: Record<ChatBackgroundType, string> = {
  COLOR: "Color plano",
  PATRON: "Patrón (estilo doodle)",
  IMAGEN: "Imagen personalizada",
};

const brandingFormSchema = z.object({
  usar_personalizacion: z.boolean(),
  color_primario: z.string().regex(HEX, "Color inválido."),
  color_secundario: z.string().regex(HEX, "Color inválido."),
  color_acento_botones: z.string().regex(HEX, "Color inválido."),
  color_texto_botones: z.string().regex(HEX, "Color inválido."),
  color_fondo_sidebar: z.string().regex(HEX, "Color inválido."),
  color_fondo_chat: z.string().regex(HEX, "Color inválido."),
  chat_bg_tipo: z.enum(["COLOR", "PATRON", "IMAGEN"]),
  chat_bg_opacidad: z.coerce.number().min(0).max(1),
});

type BrandingFormValues = z.infer<typeof brandingFormSchema>;

function fromBranding(branding: BrandingOut): BrandingFormValues {
  return {
    usar_personalizacion: branding.usar_personalizacion,
    color_primario: branding.color_primario ?? "#0F766E",
    color_secundario: branding.color_secundario ?? "#0F172A",
    color_acento_botones: branding.color_acento_botones ?? "#0F766E",
    color_texto_botones: branding.color_texto_botones ?? "#FFFFFF",
    color_fondo_sidebar: branding.color_fondo_sidebar ?? "#0F172A",
    color_fondo_chat: branding.color_fondo_chat ?? "#F1F5F9",
    chat_bg_tipo: branding.chat_bg_tipo,
    chat_bg_opacidad: branding.chat_bg_opacidad,
  };
}

export function BrandingTab() {
  const { data, isLoading, error } = useBranding();

  if (isLoading) return <FullPageSpinner />;
  if (error || !data)
    return <ErrorBanner message="No se pudo cargar la personalización de marca." />;

  // Sin `key`: el formulario NO se remonta cuando cambian el logo/favicon/fondo (la consulta se
  // invalida al subir un archivo). Remontar aquí borraría cualquier color sin guardar todavía —
  // el `reset()` explícito solo ocurre cuando el propio formulario de colores guarda (más abajo),
  // igual que `bot-tab.tsx`. Los recuadros de subida sí reciben la URL fresca vía `props`.
  return <BrandingForm branding={data} />;
}

function BrandingForm({ branding }: { branding: BrandingOut }) {
  const updateBranding = useUpdateBranding();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingFormSchema) as Resolver<BrandingFormValues>,
    defaultValues: fromBranding(branding),
  });

  const preview = useWatch({ control });

  async function onSubmit(values: BrandingFormValues) {
    setError(null);
    setSaved(false);
    try {
      const updated = await updateBranding.mutateAsync(values);
      // Sin este `reset`, `isDirty` se queda en `true` y el aviso de "Guardado" nunca aparece
      // (mismo motivo que en `bot-tab.tsx`).
      reset(fromBranding(updated));
      setSaved(true);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo guardar la personalización.",
      );
    }
  }

  async function resetToDefault() {
    setError(null);
    setSaved(false);
    try {
      const updated = await updateBranding.mutateAsync({ usar_personalizacion: false });
      reset(fromBranding(updated));
      setSaved(true);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo restablecer el diseño estándar.",
      );
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && <ErrorBanner message={error} />}
        {saved && !isDirty && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Guardado.</p>
        )}

        <Card className="flex items-center justify-between px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Usar personalización
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Apagado: se ve siempre el diseño estándar de la plataforma, sin borrar lo guardado.
            </p>
          </div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" {...register("usar_personalizacion")} />
            <div className="relative h-6 w-11 rounded-full bg-zinc-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-5 dark:bg-zinc-700" />
          </label>
        </Card>

        <Card className="space-y-4 p-4">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Logo e ícono</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AssetDropzone
              label="Logo"
              currentUrl={branding.logo_url}
              accept="image/png,image/webp,image/svg+xml"
              useUpload={useUploadBrandingLogo}
            />
            <AssetDropzone
              label="Favicon"
              currentUrl={branding.favicon_url}
              accept="image/png,image/webp,image/svg+xml,image/x-icon"
              useUpload={useUploadBrandingFavicon}
            />
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Colores</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColorField
              name="color_primario"
              label="Primario"
              control={control}
              register={register}
              setValue={setValue}
              error={errors.color_primario?.message}
            />
            <ColorField
              name="color_secundario"
              label="Secundario"
              control={control}
              register={register}
              setValue={setValue}
              error={errors.color_secundario?.message}
            />
            <ColorField
              name="color_acento_botones"
              label="Botones"
              control={control}
              register={register}
              setValue={setValue}
              error={errors.color_acento_botones?.message}
            />
            <ColorField
              name="color_texto_botones"
              label="Texto de botón"
              control={control}
              register={register}
              setValue={setValue}
              error={errors.color_texto_botones?.message}
            />
            <ColorField
              name="color_fondo_sidebar"
              label="Barra lateral"
              control={control}
              register={register}
              setValue={setValue}
              error={errors.color_fondo_sidebar?.message}
            />
            <ColorField
              name="color_fondo_chat"
              label="Fondo del chat"
              control={control}
              register={register}
              setValue={setValue}
              error={errors.color_fondo_chat?.message}
            />
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Fondo del área de chat
          </p>
          <div>
            <Label htmlFor="chat_bg_tipo">Tipo de fondo</Label>
            <Select id="chat_bg_tipo" {...register("chat_bg_tipo")}>
              {CHAT_BG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CHAT_BG_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
          {preview.chat_bg_tipo === "IMAGEN" && (
            <>
              <AssetDropzone
                label="Imagen de fondo"
                currentUrl={branding.chat_bg_imagen_url}
                accept="image/png,image/webp,image/svg+xml"
                useUpload={useUploadBrandingChatBackground}
              />
              <div>
                <Label htmlFor="chat_bg_opacidad">
                  Opacidad ({Math.round((preview.chat_bg_opacidad ?? 0.15) * 100)}%)
                </Label>
                <input
                  id="chat_bg_opacidad"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full accent-emerald-600"
                  {...register("chat_bg_opacidad")}
                />
              </div>
            </>
          )}
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="secondary" onClick={resetToDefault} disabled={isSubmitting}>
            Restablecer al diseño estándar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Guardar cambios
          </Button>
        </div>
      </form>

      <LivePreview values={preview} logoUrl={branding.logo_url} />
    </div>
  );
}

function ColorField({
  name,
  label,
  control,
  register,
  setValue,
  error,
}: {
  name: keyof BrandingFormValues & string;
  label: string;
  control: ReturnType<typeof useForm<BrandingFormValues>>["control"];
  register: ReturnType<typeof useForm<BrandingFormValues>>["register"];
  setValue: ReturnType<typeof useForm<BrandingFormValues>>["setValue"];
  error?: string;
}) {
  const value = useWatch({ control, name: name as "color_primario" }) as string;
  return (
    <div>
      <Label htmlFor={name} className="text-xs">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-zinc-300 dark:border-zinc-700"
          value={HEX.test(value ?? "") ? value : "#000000"}
          onChange={(e) =>
            setValue(name as "color_primario", e.target.value.toUpperCase(), {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <Input
          id={name}
          className="min-w-0 px-2 py-1.5 font-mono text-xs uppercase"
          {...register(name as "color_primario")}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function AssetDropzone({
  label,
  currentUrl,
  accept,
  useUpload,
}: {
  label: string;
  currentUrl: string | null;
  accept: string;
  useUpload: () => { mutateAsync: (file: File) => Promise<BrandingOut>; isPending: boolean };
}) {
  const upload = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      await upload.mutateAsync(file);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo subir el archivo.");
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    void handleFile(e.dataTransfer.files[0]);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    void handleFile(e.target.files?.[0]);
  }

  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-2 text-center transition-colors ${
          dragOver
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        {upload.isPending ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Subiendo...</p>
        ) : currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL externa (Spaces), no del proyecto
          <img src={currentUrl} alt={label} className="h-14 object-contain" />
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Arrastra o haz clic para subir
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function LivePreview({
  values,
  logoUrl,
}: {
  values: Partial<BrandingFormValues>;
  logoUrl: string | null;
}) {
  const primario = HEX.test(values.color_primario ?? "") ? values.color_primario! : "#0F766E";
  const sidebar = HEX.test(values.color_fondo_sidebar ?? "") ? values.color_fondo_sidebar! : "#0F172A";
  const boton = HEX.test(values.color_acento_botones ?? "") ? values.color_acento_botones! : "#0F766E";
  const textoBoton = HEX.test(values.color_texto_botones ?? "") ? values.color_texto_botones! : "#FFFFFF";
  const fondoChat = HEX.test(values.color_fondo_chat ?? "") ? values.color_fondo_chat! : "#F1F5F9";
  const usar = values.usar_personalizacion ?? false;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">Vista previa</p>
      <Card className="overflow-hidden">
        <div className="flex h-72">
          <div
            className="flex w-16 flex-col items-center gap-3 py-3"
            style={{ backgroundColor: usar ? sidebar : "#0F172A" }}
          >
            {logoUrl && usar ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL externa (Spaces)
              <img src={logoUrl} alt="Logo" className="h-6 w-6 rounded object-contain" />
            ) : (
              <div className="h-6 w-6 rounded bg-white/20" />
            )}
            <div className="h-2 w-8 rounded bg-white/20" />
            <div className="h-2 w-8 rounded bg-white/20" />
          </div>
          <div className="flex flex-1 flex-col">
            <div
              className="border-b border-black/5 px-4 py-2.5 text-sm font-semibold dark:border-white/5"
              style={{ color: usar ? primario : "#0F766E" }}
            >
              Conversaciones
            </div>
            <div
              className="flex flex-1 flex-col justify-end gap-2 p-3"
              style={{ backgroundColor: usar ? fondoChat : "#F1F5F9" }}
            >
              <div className="max-w-[70%] self-start rounded-2xl rounded-bl-sm bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-sm">
                Hola, ¿tienen disponibilidad?
              </div>
              <div
                className="max-w-[70%] self-end rounded-2xl rounded-br-sm px-3 py-1.5 text-xs shadow-sm"
                style={{
                  backgroundColor: usar ? boton : "#0F766E",
                  color: usar ? textoBoton : "#FFFFFF",
                }}
              >
                ¡Claro! Contame más.
              </div>
            </div>
            <div className="flex justify-end p-2">
              <button
                type="button"
                disabled
                className="rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: usar ? boton : "#0F766E",
                  color: usar ? textoBoton : "#FFFFFF",
                }}
              >
                Guardar Pedido
              </button>
            </div>
          </div>
        </div>
      </Card>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Simulación en vivo: se actualiza mientras editas, antes de guardar.
      </p>
    </div>
  );
}
