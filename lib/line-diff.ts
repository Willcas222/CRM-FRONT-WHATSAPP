export type DiffLine = { kind: "same" | "add" | "del"; text: string };

/** Diferencia línea a línea (LCS). Los prompts son de pocos cientos de líneas: O(n·m) sobra. */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const width = b.length + 1;
  // lcs[i * width + j] = largo de la subsecuencia común de a[i..] y b[j..]
  const lcs = new Array<number>((a.length + 1) * width).fill(0);
  const at = (i: number, j: number) => lcs[i * width + j] ?? 0;
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i * width + j] =
        a[i] === b[j]
          ? at(i + 1, j + 1) + 1
          : Math.max(at(i + 1, j), at(i, j + 1));
    }
  }
  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push({ kind: "same", text: a[i] ?? "" });
      i++;
      j++;
    } else if (at(i + 1, j) >= at(i, j + 1)) {
      result.push({ kind: "del", text: a[i++] ?? "" });
    } else {
      result.push({ kind: "add", text: b[j++] ?? "" });
    }
  }
  while (i < a.length) result.push({ kind: "del", text: a[i++] ?? "" });
  while (j < b.length) result.push({ kind: "add", text: b[j++] ?? "" });
  return result;
}
