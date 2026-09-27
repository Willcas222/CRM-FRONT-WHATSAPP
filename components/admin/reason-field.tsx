import { Label, Textarea } from "@/components/ui/input";

/** Motivo de un cambio del panel: obligatorio (3 a 500 caracteres) y queda en la auditoría. */
export function ReasonField({
  id = "reason",
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>Motivo del cambio (queda en la auditoría)</Label>
      <Textarea
        id={id}
        rows={2}
        maxLength={500}
        value={value}
        placeholder="Por qué haces este cambio"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export const REASON_MIN = 3;
