import { ADMIN_GUIDE } from "./admin";
import { ORGANIZATION_GUIDE } from "./organization";
import type { HelpGuide, HelpTopic } from "./types";

export type HelpAudience = HelpGuide["audience"];

export const GUIDES: Record<HelpAudience, HelpGuide> = {
  organization: ORGANIZATION_GUIDE,
  admin: ADMIN_GUIDE,
};

/** Dónde vive la página de ayuda de cada audiencia (los enlaces del popover apuntan allí). */
export const HELP_PATH: Record<HelpAudience, string> = {
  organization: "/help",
  admin: "/admin/help",
};

export function getTopic(
  audience: HelpAudience,
  id: string,
): HelpTopic | undefined {
  return GUIDES[audience].topics.find((topic) => topic.id === id);
}

/** Texto completo de un tema, en minúsculas y sin tildes, para el buscador de la ayuda. */
export function searchableText(topic: HelpTopic): string {
  const parts = [
    topic.title,
    topic.summary,
    topic.purpose,
    ...topic.points,
    ...topic.tips,
    ...(topic.cautions ?? []),
    ...topic.howTo.flatMap((h) => [h.title, ...h.steps]),
  ];
  return normalize(parts.join(" "));
}

export function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
