"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { Badge, EmptyState, ErrorBanner, Spinner } from "@/components/ui/misc";
import { ApiError, useAuth } from "@/lib/auth-context";
import {
  useAssignConversation,
  useConversation,
  useConversations,
  useHandoffConversation,
  useMarkConversationRead,
  useMessages,
  useReleaseConversation,
  useSendMessage,
  useTakeConversation,
  type ConversationFilters,
} from "@/lib/hooks/conversations";
import { useUsers } from "@/lib/hooks/users";
import type { components } from "@/lib/api-schema";
import { formatRelative, formatDateTime, initials } from "@/lib/utils";

type ConversationDetail = components["schemas"]["ConversationDetailOut"];

const STATUS_LABELS: Record<string, string> = {
  BOT_ACTIVE: "Bot activo",
  HUMAN_PENDING: "En cola",
  HUMAN_ASSIGNED: "Con un agente",
};

export default function InboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get("c") ?? undefined;
  const [filters, setFilters] = useState<ConversationFilters>({});
  const { data, isLoading } = useConversations(filters);

  function select(id: string) {
    router.push(`/inbox?c=${id}`);
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex w-80 min-h-0 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 p-3 dark:border-zinc-800">
          <Select
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: (e.target.value || undefined) as ConversationFilters["status"],
              }))
            }
          >
            <option value="">Todas</option>
            <option value="HUMAN_PENDING">En cola</option>
            <option value="HUMAN_ASSIGNED">Con un agente</option>
            <option value="BOT_ACTIVE">Bot activo</option>
          </Select>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState title="Sin conversaciones" />
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.items.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    onClick={() => select(conversation.id)}
                    className={`block w-full px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                      selectedId === conversation.id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {conversation.contact.name || conversation.contact.phone}
                      </span>
                      {conversation.unread_count > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {conversation.last_message?.content ?? "Sin mensajes"}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <Badge
                        tone={
                          conversation.status === "HUMAN_PENDING"
                            ? "amber"
                            : conversation.status === "BOT_ACTIVE"
                              ? "blue"
                              : "neutral"
                        }
                      >
                        {STATUS_LABELS[conversation.status]}
                      </Badge>
                      <span className="text-[11px] text-zinc-400">
                        {formatRelative(conversation.last_message_at)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {selectedId ? (
          <ConversationThread conversationId={selectedId} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState title="Selecciona una conversación" />
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationThread({ conversationId }: { conversationId: string }) {
  const { user } = useAuth();
  const { data: conversation } = useConversation(conversationId);
  const { data: messages } = useMessages(conversationId);
  const { data: users } = useUsers();
  const sendMessage = useSendMessage(conversationId);
  const markRead = useMarkConversationRead(conversationId);
  const takeConversation = useTakeConversation(conversationId);
  const releaseConversation = useReleaseConversation(conversationId);
  const handoffConversation = useHandoffConversation(conversationId);
  const assignConversation = useAssignConversation(conversationId);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead.mutate();
    // solo al abrir o cambiar de conversación
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [conversationId, messages?.items.length]);

  async function handleSend() {
    if (!text.trim()) return;
    setError(null);
    try {
      await sendMessage.mutateAsync({ type: "TEXT", text: text.trim() });
      setText("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo enviar el mensaje.");
    }
  }

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo completar la acción.");
    }
  }

  if (!conversation) return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ThreadHeader
        conversation={conversation}
        onTake={() => run(() => takeConversation.mutateAsync())}
        onRelease={() => run(() => releaseConversation.mutateAsync())}
        onHandoff={() => run(() => handoffConversation.mutateAsync({}))}
        onAssign={(agentId) => run(() => assignConversation.mutateAsync({ agent_id: agentId }))}
        users={users?.items ?? []}
      />

      {error && (
        <div className="px-4 pt-2">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages?.items.map((message) => {
          const outbound = message.direction === "OUTBOUND";
          return (
            <div key={message.id} className={`flex ${outbound ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-md rounded-2xl px-3.5 py-2 text-sm ${
                  outbound
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content ?? `[${message.message_type}]`}</p>
                <p
                  className={`mt-1 text-[10px] ${outbound ? "text-emerald-100" : "text-zinc-400"}`}
                >
                  {message.sender_name && `${message.sender_name} · `}
                  {formatDateTime(message.occurred_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={2}
          placeholder="Escribe un mensaje…"
          className="flex-1 resize-none"
        />
        <Button onClick={handleSend} loading={sendMessage.isPending}>
          Enviar
        </Button>
      </div>
      <p className="px-3 pb-2 text-[11px] text-zinc-400">
        {user?.name}: solo puedes responder si la conversación está asignada a ti.
      </p>
    </div>
  );
}

function ThreadHeader({
  conversation,
  onTake,
  onRelease,
  onHandoff,
  onAssign,
  users,
}: {
  conversation: ConversationDetail;
  onTake: () => void;
  onRelease: () => void;
  onHandoff: () => void;
  onAssign: (agentId: string) => void;
  users: { id: string; name: string }[];
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
          {initials(conversation.contact.name || conversation.contact.phone)}
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {conversation.contact.name || conversation.contact.phone}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {STATUS_LABELS[conversation.status]}
            {conversation.assigned_agent && ` · ${conversation.assigned_agent.name}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {conversation.status === "HUMAN_PENDING" && (
          <Button size="sm" onClick={onTake}>
            Tomar
          </Button>
        )}
        {conversation.status === "BOT_ACTIVE" && (
          <Button size="sm" variant="secondary" onClick={onHandoff}>
            Pasar a una persona
          </Button>
        )}
        {conversation.status === "HUMAN_ASSIGNED" && (
          <Button size="sm" variant="secondary" onClick={onRelease}>
            Devolver al bot
          </Button>
        )}
        {conversation.status !== "BOT_ACTIVE" && (
          <Select
            className="w-40"
            value={conversation.assigned_agent?.id ?? ""}
            onChange={(e) => e.target.value && onAssign(e.target.value)}
          >
            <option value="">Asignar a…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}
