"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/misc";
import {
  GUIDES,
  HELP_PATH,
  normalize,
  searchableText,
  type HelpAudience,
} from "@/lib/help";
import type { HelpHowTo, HelpTopic } from "@/lib/help/types";
import { cn } from "@/lib/utils";

const EXTRA_SECTIONS = [
  { id: "primeros-pasos", label: "Primeros pasos" },
  { id: "flujo-de-trabajo", label: "Cómo trabajar cada día" },
] as const;

/**
 * Centro de ayuda: el manual completo dentro de la aplicación, con buscador y enlaces directos
 * (`/help#inbox`). Es la misma fuente que los «!» de cada pantalla y que los manuales en Markdown.
 */
export function HelpCenter({ audience }: { audience: HelpAudience }) {
  const guide = GUIDES[audience];
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());

  const index = useMemo(
    () => guide.topics.map((topic) => ({ topic, text: searchableText(topic) })),
    [guide],
  );
  const visible = useMemo(
    () =>
      q
        ? index
            .filter((entry) => entry.text.includes(q))
            .map((entry) => entry.topic)
        : guide.topics,
    [index, guide, q],
  );

  // Llegar con #tema (desde un «!») lleva directo a esa sección, también si la página ya estaba abierta
  useEffect(() => {
    function goToHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
    }
    goToHash();
    window.addEventListener("hashchange", goToHash);
    return () => window.removeEventListener("hashchange", goToHash);
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 print:mb-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {guide.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {guide.intro}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 print:hidden dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Imprimir / guardar como PDF
        </button>
      </div>

      <div className="mb-6 print:hidden">
        <label htmlFor="help-search" className="sr-only">
          Buscar en la ayuda
        </label>
        <input
          id="help-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en la ayuda: «tomar», «límite», «token»…"
          className="block w-full max-w-xl rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <nav
          aria-label="Índice de la ayuda"
          className="lg:sticky lg:top-4 lg:h-fit lg:w-60 lg:shrink-0 print:hidden"
        >
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
            {!q &&
              EXTRA_SECTIONS.map((s) => (
                <IndexLink key={s.id} href={`#${s.id}`}>
                  {s.label}
                </IndexLink>
              ))}
            {visible.map((topic) => (
              <IndexLink key={topic.id} href={`#${topic.id}`}>
                {topic.title}
              </IndexLink>
            ))}
            {!q && (
              <>
                <IndexLink href="#glosario">Glosario</IndexLink>
                <IndexLink href="#preguntas-frecuentes">
                  Preguntas frecuentes
                </IndexLink>
              </>
            )}
          </ul>
        </nav>

        <div className="min-w-0 flex-1 space-y-10">
          {!q && (
            <>
              <Steps id="primeros-pasos" howTo={guide.quickStart} />
              <Steps id="flujo-de-trabajo" howTo={guide.workflow} />
            </>
          )}

          {visible.length === 0 && (
            <p className="text-sm text-zinc-500">
              No encontré nada para «{query}». Prueba con otra palabra.
            </p>
          )}
          {visible.map((topic) => (
            <Topic key={topic.id} topic={topic} audience={audience} />
          ))}

          {!q && (
            <>
              <section id="glosario" className="scroll-mt-4">
                <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Glosario
                </h2>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {guide.glossary.map((item) => (
                    <Card key={item.term} className="p-4">
                      <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.term}
                      </dt>
                      <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        {item.definition}
                      </dd>
                    </Card>
                  ))}
                </dl>
              </section>
              <section id="preguntas-frecuentes" className="scroll-mt-4">
                <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Preguntas frecuentes
                </h2>
                <div className="space-y-2">
                  {guide.faq.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 print:open"
                    >
                      <summary className="cursor-pointer text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.question}
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function IndexLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li className="shrink-0">
      <a
        href={href}
        className="block whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 lg:whitespace-normal dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        {children}
      </a>
    </li>
  );
}

function Steps({ id, howTo }: { id: string; howTo: HelpHowTo }) {
  return (
    <section id={id} className="scroll-mt-4">
      <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {howTo.title}
      </h2>
      <Numbered steps={howTo.steps} />
    </section>
  );
}

function Numbered({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li
          key={step}
          className="flex gap-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function Topic({
  topic,
  audience,
}: {
  topic: HelpTopic;
  audience: HelpAudience;
}) {
  const related = topic.related
    ?.map((id) => GUIDES[audience].topics.find((t) => t.id === id))
    .filter((t): t is HelpTopic => t !== undefined);
  return (
    <section id={topic.id} className="scroll-mt-4 break-inside-avoid">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {topic.title}
        </h2>
        {topic.route && (
          <Link
            href={topic.route}
            className="text-sm font-medium text-emerald-700 hover:underline print:hidden dark:text-emerald-300"
          >
            Ir a la sección →
          </Link>
        )}
      </div>
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium leading-relaxed text-emerald-900 dark:bg-emerald-900/25 dark:text-emerald-100">
        {topic.summary}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {topic.purpose}
      </p>

      {topic.howTo.map((how) => (
        <div key={how.title} className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {how.title}
          </h3>
          <Numbered steps={how.steps} />
        </div>
      ))}

      {topic.tips.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Cómo sacarle el mejor provecho
          </h3>
          <ul className="space-y-1.5">
            {topic.tips.map((tip) => (
              <li
                key={tip}
                className="flex gap-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
              >
                <span aria-hidden className="mt-0.5">
                  💡
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {topic.cautions && topic.cautions.length > 0 && (
        <div
          className={cn(
            "mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40",
          )}
        >
          <h3 className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-200">
            Ten en cuenta
          </h3>
          <ul className="space-y-1">
            {topic.cautions.map((caution) => (
              <li
                key={caution}
                className="text-sm leading-relaxed text-amber-900 dark:text-amber-100"
              >
                • {caution}
              </li>
            ))}
          </ul>
        </div>
      )}

      {related && related.length > 0 && (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 print:hidden">
          Relacionado:{" "}
          {related.map((r, i) => (
            <span key={r.id}>
              {i > 0 && " · "}
              <a
                href={`${HELP_PATH[audience]}#${r.id}`}
                className="font-medium text-emerald-700 hover:underline dark:text-emerald-300"
              >
                {r.title}
              </a>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
