"use client";

import type { WordSheet } from "@/types";

const STORAGE_KEY = "vocabsheet.sheets.v1";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function getSheets(): WordSheet[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const sheets = JSON.parse(raw) as WordSheet[];
    return Array.isArray(sheets) ? sheets : [];
  } catch {
    return [];
  }
}

export function getSheet(id: string): WordSheet | null {
  return getSheets().find((sheet) => sheet.id === id) ?? null;
}

export function saveSheet(sheet: WordSheet) {
  const sheets = getSheets();
  const existingIndex = sheets.findIndex((item) => item.id === sheet.id);
  const nextSheets =
    existingIndex >= 0
      ? sheets.map((item) => (item.id === sheet.id ? sheet : item))
      : [sheet, ...sheets];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSheets));
}

export function deleteSheet(id: string) {
  const sheets = getSheets().filter((sheet) => sheet.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
}

export function exportSheet(sheet: WordSheet) {
  const blob = new Blob([JSON.stringify(sheet, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sheet.title || "vocabsheet"}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
