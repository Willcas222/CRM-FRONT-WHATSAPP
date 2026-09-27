"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api-client";

/** Confirmación de una acción peligrosa: explica el efecto y exige un motivo (queda en auditoría). */
export function ConfirmReasonModal({
  open,
  onClose,
  title,
  warning,
  confirmLabel,
  danger,
  withReason = true,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  warning: string;
  confirmLabel: string;
  danger?: boolean;
  withReason?: boolean;
  onConfirm: (reason: string) => Promise<unknown>;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const tooShort = withReason && reason.trim().length < 3;

  function close() {
    setReason("");
    setError(null);
    onClose();
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      close();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo completar la acción.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{warning}</p>
        {error && <ErrorBanner message={error} />}
        {withReason && (
          <div>
            <Label htmlFor="reason">
              Motivo (obligatorio, queda en auditoría)
            </Label>
            <Textarea
              id="reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            disabled={tooShort}
            loading={busy}
            onClick={() => void submit()}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
