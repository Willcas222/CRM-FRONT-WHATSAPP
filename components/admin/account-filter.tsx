"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { useAdminAccounts } from "@/lib/hooks/admin-accounts";

/** Acota una vista a una organización: busca por nombre y elige de los resultados. */
export function AccountFilter({
  accountId,
  onChange,
}: {
  accountId: string | undefined;
  onChange: (accountId: string | undefined) => void;
}) {
  const [search, setSearch] = useState("");
  const { data } = useAdminAccounts({
    search: search.trim() || undefined,
    limit: 10,
  });
  const selected = data?.items.find((a) => a.id === accountId);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-48">
        <Input
          placeholder="Buscar organización…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <select
        value={accountId ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="">Toda la plataforma</option>
        {accountId && !selected && (
          <option value={accountId}>Organización seleccionada</option>
        )}
        {data?.items.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>
    </div>
  );
}
