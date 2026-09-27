"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { HelpButton } from "@/components/help/help-button";
import { CustomerSummary } from "@/components/inbox/customer-summary";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Badge, EmptyState, ErrorBanner, Spinner } from "@/components/ui/misc";
import { ApiError, useAuth } from "@/lib/auth-context";
import {
  useAssignConversation,
  useConversation,
  fetchOlderMessages,
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
import {
  cn,
  dayKey,
  formatDayLabel,
  formatRelative,
  formatTime,
  initials,
} from "@/lib/utils";

type ConversationDetail = components["schemas"]["ConversationDetailOut"];
type Message = components["schemas"]["MessageOut"];

const STATUS_LABELS: Record<string, string> = {
  BOT_ACTIVE: "Bot activo",
  HUMAN_PENDING: "En cola",
  HUMAN_ASSIGNED: "Con un agente",
};

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  IMAGE: "📷 Imagen",
  AUDIO: "🎤 Audio",
  VIDEO: "🎬 Video",
  DOCUMENT: "📄 Documento",
  LOCATION: "📍 Ubicación",
  STICKER: "Sticker",
  REACTION: "Reacción",
  TEMPLATE: "Plantilla",
  UNSUPPORTED: "Mensaje no compatible",
};

export default function InboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get("c") ?? undefined;
  const initialData = searchParams.get("data");
  const [filters, setFilters] = useState<ConversationFilters>(
    initialData === "complete" || initialData === "missing"
      ? { data: initialData }
      : {},
  );
  const { data, isLoading } = useConversations(filters);

  function select(id: string) {
    router.push(`/inbox?c=${id}`);
  }

  return (
    <div className="flex h-full min-h-0">
      <div
        className={cn(
          "min-h-0 w-full shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex lg:w-[22rem] dark:border-zinc-800 dark:bg-zinc-900",
          selectedId ? "hidden" : "flex",
        )}
      >
        <div className="border-b border-zinc-200 p-3 dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-2 px-1">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Bandeja
            </h2>
            <HelpButton topic="inbox" />
          </div>
          <Select
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: (e.target.value ||
                  undefined) as ConversationFilters["status"],
              }))
            }
          >
            <option value="">Todas las conversaciones</option>
            <option value="HUMAN_PENDING">
              En cola (esperan a una persona)
            </option>
            <option value="HUMAN_ASSIGNED">Con un agente</option>
            <option value="BOT_ACTIVE">Atendidas por el bot</option>
          </Select>
          <Select
            className="mt-2"
            value={filters.data ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                data: (e.target.value ||
                  undefined) as ConversationFilters["data"],
              }))
            }
            aria-label="Filtrar por datos del cliente"
          >
            <option value="">Con o sin datos completos</option>
            <option value="complete">Datos completos</option>
            <option value="missing">Faltan datos</option>
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
            <ul>
              {data.items.map((conversation) => {
                const name =
                  conversation.contact.name || conversation.contact.phone;
                const unread = conversation.unread_count > 0;
                return (
                  <li key={conversation.id}>
                    <button
                      onClick={() => select(conversation.id)}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors dark:border-zinc-800/70",
                        selectedId === conversation.id
                          ? "bg-emerald-50 dark:bg-emerald-900/25"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                      )}
                    >
                      <Avatar name={name} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              "truncate text-sm text-zinc-900 dark:text-zinc-100",
                              unread ? "font-semibold" : "font-medium",
                            )}
                          >
                            {name}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 text-[11px]",
                              unread
                                ? "font-medium text-emerald-600"
                                : "text-zinc-400",
                            )}
                          >
                            {formatRelative(conversation.last_message_at)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              "truncate text-[13px]",
                              unread
                                ? "text-zinc-700 dark:text-zinc-200"
                                : "text-zinc-500 dark:text-zinc-400",
                            )}
                          >
                            {conversation.last_message?.content ??
                              "Sin mensajes"}
                          </p>
                          {unread && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold text-white">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
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
                          {conversation.data_total > 0 && (
                            <Badge
                              tone={
                                conversation.data_done ===
                                conversation.data_total
                                  ? "green"
                                  : "amber"
                              }
                              title="Datos obligatorios que el bot ya reunió"
                            >
                              {conversation.data_done}/{conversation.data_total}{" "}
                              datos
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div
        className={cn(
          "min-h-0 min-w-0 flex-1",
          !selectedId && "hidden lg:block",
        )}
      >
        {selectedId ? (
          <ConversationThread
            key={selectedId}
            conversationId={selectedId}
            onBack={() => router.push("/inbox")}
          />
        ) : (
          <div className="chat-wall flex h-full items-center justify-center">
            <div className="rounded-2xl bg-white/80 px-8 py-6 text-center shadow-sm backdrop-blur dark:bg-zinc-900/80">
              <p className="text-base font-medium text-zinc-800 dark:text-zinc-100">
                Selecciona una conversación
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Elige un chat de la izquierda para leer y responder.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const WINDOW_WARNING_MS = 2 * 60 * 60 * 1000;

function formatTimeLeft(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** El backend entrega lo más reciente primero; el chat se lee de arriba (antiguo) a abajo (nuevo). */
function oldestFirst(items: Message[] | undefined): Message[] {
  return [...(items ?? [])].sort(
    (a, b) =>
      new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
  );
}

function ConversationThread({
  conversationId,
  onBack,
}: {
  conversationId: string;
  onBack: () => void;
}) {
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Historial anterior: la página viva (la más reciente) se refresca sola cada pocos segundos; las
  // más antiguas se piden a demanda con el cursor y se conservan aparte
  const [older, setOlder] = useState<Message[]>([]);
  const [olderPage, setOlderPage] = useState<{
    cursor: string | null;
    hasMore: boolean;
  } | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  // Reloj para que el aviso de la ventana se actualice sin recargar
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const restoreFrom = useRef<number | null>(null);
  const cursor = olderPage ? olderPage.cursor : (messages?.next_cursor ?? null);
  const hasMore = olderPage ? olderPage.hasMore : (messages?.has_more ?? false);
  const ordered = useMemo(() => {
    const live = oldestFirst(messages?.items);
    const liveIds = new Set(live.map((m) => m.id));
    return [...oldestFirst(older).filter((m) => !liveIds.has(m.id)), ...live];
  }, [messages?.items, older]);
  // El hilo no se pinta hasta tener la conversación: hay que volver a bajar cuando aparece
  const ready = conversation !== undefined;

  useEffect(() => {
    markRead.mutate();
    stickToBottom.current = true;
    // solo al abrir o cambiar de conversación
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Sigue el final del chat, salvo que la persona haya subido a leer mensajes antiguos
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [conversationId, ordered.length, ready, error]);

  // Al insertar mensajes ARRIBA, se conserva lo que la persona estaba leyendo (corre justo después de
  // pintar, antes de que el navegador dibuje, para que no haya salto visible)
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && restoreFrom.current !== null) {
      el.scrollTop = el.scrollHeight - restoreFrom.current;
      restoreFrom.current = null;
    }
  }, [older]);

  async function loadOlder() {
    if (!cursor || loadingOlder) return;
    const el = scrollRef.current;
    const before = el ? el.scrollHeight - el.scrollTop : 0;
    setLoadingOlder(true);
    try {
      const page = await fetchOlderMessages(conversationId, cursor);
      stickToBottom.current = false;
      setOlder((current) => [...current, ...page.items]);
      setOlderPage({ cursor: page.next_cursor, hasMore: page.has_more });
      restoreFrom.current = before; // el efecto de layout devuelve la posición de lectura
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo cargar el historial.",
      );
    } finally {
      setLoadingOlder(false);
    }
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (el)
      stickToBottom.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  // La barra crece con el texto (hasta un máximo) en vez de obligar a desplazarse dentro de ella
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [text]);

  async function handleSend() {
    if (!text.trim()) return;
    setError(null);
    try {
      await sendMessage.mutateAsync({ type: "TEXT", text: text.trim() });
      setText("");
      stickToBottom.current = true;
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo enviar el mensaje.",
      );
    }
  }

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo completar la acción.",
      );
    }
  }

  if (!conversation) return null;

  const mine = conversation.assigned_agent?.id === user?.id;
  const assignedToMe = conversation.status === "HUMAN_ASSIGNED" && mine;
  // Ventana de 24 h de WhatsApp: pasada la hora, solo se admiten plantillas aprobadas, no texto libre.
  const expiresAt = conversation.window_expires_at
    ? new Date(conversation.window_expires_at).getTime()
    : null;
  const windowOpen = expiresAt !== null ? expiresAt > now : false;
  const msLeft = expiresAt !== null ? expiresAt - now : 0;
  const expiringSoon = windowOpen && msLeft <= WINDOW_WARNING_MS;
  const canReply = assignedToMe && windowOpen;
  const cannotReplyWhy =
    conversation.status === "BOT_ACTIVE"
      ? "El bot está atendiendo esta conversación. Pulsa «Pasar a una persona» para intervenir."
      : conversation.status === "HUMAN_PENDING"
        ? "Esta conversación espera a una persona. Pulsa «Tomar» para responder."
        : `Está asignada a ${conversation.assigned_agent?.name ?? "otra persona"}. Reasígnala a ti para responder.`;

  return (
    <div className="flex h-full min-h-0">
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <ThreadHeader
          onBack={onBack}
          onOpenSummary={() => setSummaryOpen(true)}
          conversation={conversation}
          onTake={() => run(() => takeConversation.mutateAsync())}
          onRelease={() => run(() => releaseConversation.mutateAsync())}
          onHandoff={() => run(() => handoffConversation.mutateAsync({}))}
          onAssign={(agentId) =>
            run(() => assignConversation.mutateAsync({ agent_id: agentId }))
          }
          users={users?.items ?? []}
        />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="chat-wall min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-10"
        >
          {hasMore && (
            <div className="mb-2 flex justify-center">
              <button
                onClick={loadOlder}
                disabled={loadingOlder}
                className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-medium text-emerald-700 shadow-sm hover:bg-white disabled:opacity-60 dark:bg-zinc-800/90 dark:text-emerald-300"
              >
                {loadingOlder ? "Cargando…" : "Cargar mensajes anteriores"}
              </button>
            </div>
          )}
          {ordered.map((message, i) => {
            const previous = ordered[i - 1];
            const newDay =
              !previous ||
              dayKey(previous.occurred_at) !== dayKey(message.occurred_at);
            const startsGroup =
              newDay ||
              previous.direction !== message.direction ||
              previous.sender_type !== message.sender_type;
            return (
              <Fragment key={message.id}>
                {newDay && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:bg-zinc-800/90 dark:text-zinc-300">
                      {formatDayLabel(message.occurred_at)}
                    </span>
                  </div>
                )}
                <Bubble message={message} startsGroup={startsGroup} />
              </Fragment>
            );
          })}
        </div>

        {error && (
          <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
            <ErrorBanner message={error} />
          </div>
        )}

        <div className="border-t border-zinc-200 bg-zinc-100 px-3 py-3 sm:px-4 dark:border-zinc-800 dark:bg-zinc-900">
          {assignedToMe && !windowOpen && (
            <p
              role="alert"
              className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200"
            >
              {expiresAt === null
                ? "Este contacto aún no ha escrito: WhatsApp no permite enviarle texto libre hasta que lo haga."
                : "Pasaron más de 24 h desde el último mensaje del cliente: WhatsApp ya no permite enviarle texto libre. Podrás responder cuando él escriba de nuevo."}
            </p>
          )}
          {expiringSoon && (
            <p
              role="status"
              className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            >
              Ojo: la ventana de respuesta de WhatsApp se cierra en{" "}
              {formatTimeLeft(msLeft)}. Después no podrás enviar texto libre.
            </p>
          )}
          {!assignedToMe && (
            <p className="mb-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {cannotReplyWhy}
            </p>
          )}
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              disabled={!canReply}
              placeholder={
                canReply
                  ? "Escribe un mensaje"
                  : assignedToMe
                    ? "Ventana de 24 h cerrada"
                    : "No puedes responder todavía"
              }
              className="min-h-14 flex-1 resize-none disabled:cursor-not-allowed disabled:opacity-60 rounded-3xl border border-transparent bg-white px-5 py-4 text-[15px] leading-6 text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              onClick={handleSend}
              disabled={!canReply || sendMessage.isPending || !text.trim()}
              aria-label="Enviar mensaje"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
            >
              {sendMessage.isPending ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="currentColor"
                >
                  <path d="M3.4 20.4 21 12 3.4 3.6l-.02 6.5L15 12 3.38 13.9l.02 6.5Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <CustomerSummary
        conversation={conversation}
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
      />
    </div>
  );
}

function Ticks({ status }: { status: Message["status"] }) {
  if (status === "FAILED") {
    return (
      <span title="No se pudo enviar" className="font-bold text-red-500">
        !
      </span>
    );
  }
  if (status === "PENDING") return <span title="Enviando">🕓</span>;
  const double = status === "DELIVERED" || status === "READ";
  return (
    <span
      title={
        status === "READ"
          ? "Leído"
          : status === "DELIVERED"
            ? "Entregado"
            : "Enviado"
      }
      className={
        status === "READ"
          ? "text-sky-500"
          : "text-zinc-500 dark:text-emerald-100/70"
      }
    >
      {double ? "✓✓" : "✓"}
    </span>
  );
}

// Un mensaje largo (WhatsApp admite hasta 4096 caracteres) se recoge para no ocupar varias pantallas
const COLLAPSE_CHARS = 700;
const COLLAPSE_LINES = 12;

function Bubble({
  message,
  startsGroup,
}: {
  message: Message;
  startsGroup: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const outbound = message.direction === "OUTBOUND";
  const collapsible =
    !!message.content &&
    (message.content.length > COLLAPSE_CHARS ||
      message.content.split(/\r?\n/).length > COLLAPSE_LINES);
  const sender =
    message.sender_type === "BOT"
      ? "Bot"
      : message.sender_type === "AGENT"
        ? message.sender_name
        : null;
  return (
    <div
      className={cn(
        "flex",
        outbound ? "justify-end" : "justify-start",
        startsGroup ? "mt-3" : "mt-0.5",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 pb-1.5 pt-2 text-[15px] leading-snug shadow-sm sm:max-w-[65%]",
          outbound
            ? "bg-bubble-out text-zinc-900 dark:bg-bubble-out-dark dark:text-zinc-50"
            : "bg-bubble-in text-zinc-900 dark:bg-bubble-in-dark dark:text-zinc-100",
          startsGroup && (outbound ? "rounded-tr-none" : "rounded-tl-none"),
        )}
      >
        {outbound && sender && startsGroup && (
          <p className="mb-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {sender}
          </p>
        )}
        <p
          className={cn(
            "whitespace-pre-wrap break-words",
            collapsible && !expanded && "line-clamp-12",
          )}
        >
          {message.content ?? (
            <span className="italic text-zinc-500 dark:text-zinc-300">
              {MESSAGE_TYPE_LABELS[message.message_type] ??
                message.message_type}
            </span>
          )}
        </p>
        {collapsible && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
        <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-zinc-500 dark:text-zinc-300/70">
          {formatTime(message.occurred_at)}
          {outbound && <Ticks status={message.status} />}
        </p>
      </div>
    </div>
  );
}

function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
        size === "lg" ? "h-12 w-12 text-sm" : "h-10 w-10 text-sm",
      )}
    >
      {initials(name)}
    </span>
  );
}

function ThreadHeader({
  onBack,
  onOpenSummary,
  conversation,
  onTake,
  onRelease,
  onHandoff,
  onAssign,
  users,
}: {
  onBack: () => void;
  onOpenSummary: () => void;
  conversation: ConversationDetail;
  onTake: () => void;
  onRelease: () => void;
  onHandoff: () => void;
  onAssign: (agentId: string) => void;
  users: { id: string; name: string }[];
}) {
  const name = conversation.contact.name || conversation.contact.phone;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-zinc-200 bg-zinc-100 px-3 py-2.5 sm:px-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          onClick={onBack}
          aria-label="Volver a la lista de conversaciones"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-200 lg:hidden dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <Avatar name={name} />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
            {name}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {conversation.contact.name && `${conversation.contact.phone} · `}
            {STATUS_LABELS[conversation.status]}
            {conversation.assigned_agent &&
              ` · ${conversation.assigned_agent.name}`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onOpenSummary}
          className="2xl:hidden"
        >
          Ficha
        </Button>
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
