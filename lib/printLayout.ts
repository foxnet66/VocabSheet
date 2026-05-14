import type { WordItem, WordSheet } from "@/types";

export function getCardsPerPage(sheet: WordSheet) {
  return Math.max(1, sheet.layout.columns * sheet.layout.rows);
}

export function paginateWords(words: WordItem[], perPage: number) {
  const pages: WordItem[][] = [];

  for (let index = 0; index < words.length; index += perPage) {
    pages.push(words.slice(index, index + perPage));
  }

  return pages.length ? pages : [[]];
}

export function alignBackPage(pageWords: WordItem[], sheet: WordSheet) {
  const { columns, rows, backSideLayout } = sheet.layout;
  const mode = backSideLayout === "auto" ? "mirror-horizontal" : backSideLayout;
  const cells = Array.from({ length: columns * rows }, (_, index) => pageWords[index] ?? null);

  if (mode === "none") {
    return cells;
  }

  const grid = Array.from({ length: rows }, (_, row) =>
    cells.slice(row * columns, row * columns + columns)
  );

  const mirrored =
    mode === "mirror-vertical"
      ? [...grid].reverse()
      : grid.map((row) => [...row].reverse());

  return mirrored.flat();
}
