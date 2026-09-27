/**
 * Ayuda del producto: UNA sola fuente para tres usos.
 *  1. El «!» de cada sección (popover): `summary` + `points`.
 *  2. La página Ayuda dentro de la app (centro de ayuda): todo el tema.
 *  3. Los manuales en Markdown (`npm run generate-manuals` → docs/MANUAL_*.md).
 * Así el texto no se desactualiza en tres lugares distintos.
 *
 * Este archivo solo tiene tipos: lo importa también Node (sin compilar) al generar los manuales.
 */

export interface HelpHowTo {
  /** «Cómo registrar un contacto», «Cómo pasar una conversación a una persona»… */
  title: string;
  steps: string[];
}

export interface HelpTopic {
  /** identificador estable; es el ancla de la URL (`/help#inbox`) */
  id: string;
  title: string;
  /** ruta de la pantalla a la que pertenece (para el enlace «Ir a la sección») */
  route?: string;
  /** una o dos frases: lo que muestra el popover */
  summary: string;
  /** 3 a 5 viñetas cortas para el popover: qué puedes hacer aquí */
  points: string[];
  /** explicación completa: para qué sirve y cómo pensar en ella */
  purpose: string;
  howTo: HelpHowTo[];
  /** cómo sacarle el mejor provecho */
  tips: string[];
  /** lo que puede salir mal o conviene no hacer */
  cautions?: string[];
  /** ids de temas relacionados */
  related?: string[];
}

export interface HelpTerm {
  term: string;
  definition: string;
}

export interface HelpFaq {
  question: string;
  answer: string;
}

export interface HelpGuide {
  audience: "organization" | "admin";
  title: string;
  /** a quién va dirigido y qué encontrará */
  intro: string;
  quickStart: HelpHowTo;
  /** la manera recomendada de trabajar, de principio a fin */
  workflow: HelpHowTo;
  topics: HelpTopic[];
  glossary: HelpTerm[];
  faq: HelpFaq[];
}
