#!/usr/bin/env node
// Genera los manuales en Markdown (docs/MANUAL_ORGANIZACION.md y docs/MANUAL_ADMIN.md) desde la MISMA
// fuente que la ayuda dentro de la aplicación (lib/help/*.ts). Así el manual y los «!» nunca se contradicen.
//   npm run generate-manuals
// Node 22 ejecuta los .ts quitando los tipos (los archivos de lib/help solo usan `import type`).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { ORGANIZATION_GUIDE } = await import("../lib/help/organization.ts");
const { ADMIN_GUIDE } = await import("../lib/help/admin.ts");

// Mismo criterio que GitHub y VS Code: minúsculas, se conservan letras (con tildes) y números, se quitan
// signos y cada espacio pasa a guion. «Configuración · Cuenta» → «configuración--cuenta».
const anchor = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, "")
    .replace(/ /g, "-");

const numbered = (steps) => steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
const bullets = (items) => items.map((s) => `- ${s}`).join("\n");

function render(guide, otherManual) {
  const out = [];
  out.push(`# ${guide.title}`, "");
  out.push(
    "> Este documento se genera automáticamente desde la ayuda de la aplicación (`lib/help`). " +
      "No lo edites a mano: cambia el texto en `lib/help` y ejecuta `npm run generate-manuals`.",
    "",
  );
  out.push(guide.intro, "");
  out.push(
    `También encuentras esta misma información dentro de la aplicación: en el menú **Ayuda** y en el símbolo **!** junto al título de cada sección.` +
      (otherManual ? ` Para la otra mitad del producto, consulta \`${otherManual}\`.` : ""),
    "",
  );

  out.push("## Contenido", "");
  out.push(`- [Primeros pasos](#${anchor("Primeros pasos")})`, `- [Cómo trabajar cada día](#${anchor("Cómo trabajar cada día")})`);
  for (const t of guide.topics) out.push(`- [${t.title}](#${anchor(t.title)})`);
  out.push("- [Glosario](#glosario)", "- [Preguntas frecuentes](#preguntas-frecuentes)", "");

  out.push("## Primeros pasos", "", `**${guide.quickStart.title}**`, "", numbered(guide.quickStart.steps), "");
  out.push("## Cómo trabajar cada día", "", `**${guide.workflow.title}**`, "", numbered(guide.workflow.steps), "");

  out.push("## Guía por sección", "");
  for (const t of guide.topics) {
    out.push(`### ${t.title}`, "");
    if (t.route) out.push(`*Pantalla: \`${t.route}\`*`, "");
    out.push(`> ${t.summary}`, "");
    out.push(t.purpose, "");
    out.push("**En resumen, aquí puedes:**", "", bullets(t.points), "");
    for (const how of t.howTo) out.push(`#### ${how.title}`, "", numbered(how.steps), "");
    if (t.tips.length) out.push("#### Cómo sacarle el mejor provecho", "", bullets(t.tips), "");
    if (t.cautions?.length) out.push("#### Ten en cuenta", "", bullets(t.cautions), "");
    const related = (t.related ?? [])
      .map((id) => guide.topics.find((x) => x.id === id))
      .filter(Boolean)
      .map((x) => `[${x.title}](#${anchor(x.title)})`);
    if (related.length) out.push(`**Relacionado:** ${related.join(" · ")}`, "");
  }

  out.push("## Glosario", "");
  for (const g of guide.glossary) out.push(`- **${g.term}:** ${g.definition}`);
  out.push("", "## Preguntas frecuentes", "");
  for (const f of guide.faq) out.push(`**${f.question}**`, "", f.answer, "");
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

mkdirSync(resolve(root, "docs"), { recursive: true });
const files = [
  ["docs/MANUAL_ORGANIZACION.md", render(ORGANIZATION_GUIDE, "docs/MANUAL_ADMIN.md")],
  ["docs/MANUAL_ADMIN.md", render(ADMIN_GUIDE, "docs/MANUAL_ORGANIZACION.md")],
];
for (const [path, content] of files) {
  writeFileSync(resolve(root, path), content, "utf8");
  console.log(`${path}: ${content.split("\n").length} líneas, ${content.split(/\s+/).length} palabras`);
}
