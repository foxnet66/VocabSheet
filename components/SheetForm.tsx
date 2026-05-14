"use client";

import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { createId } from "@/lib/id";
import { parseBulkText, removeDuplicateWords } from "@/lib/parser";
import { getSheet, saveSheet } from "@/lib/storage";
import type { WordItem, WordSheet } from "@/types";

const defaultLayout: WordSheet["layout"] = {
  paperSize: "A4",
  orientation: "portrait",
  columns: 3,
  rows: 4,
  duplexMode: "duplex",
  backSideLayout: "mirror-horizontal",
  showCutLines: true,
  frontFontSize: 22,
  backFontSize: 10
};

function createBlankRow(): WordItem {
  return { id: createId("word"), word: "", definition: "" };
}

function createEmptySheet(): WordSheet {
  const now = new Date().toISOString();
  return {
    id: createId("sheet"),
    title: "Untitled vocabulary sheet",
    words: [createBlankRow()],
    sourceType: "manual",
    layout: defaultLayout,
    createdAt: now,
    updatedAt: now
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeImportedSheet(value: unknown): WordSheet {
  if (!isRecord(value)) {
    throw new Error("The selected file is not a VocabSheet JSON object.");
  }

  const rawWords = value.words;
  const rawLayout = value.layout;

  if (!Array.isArray(rawWords) || !isRecord(rawLayout)) {
    throw new Error("The selected file is missing words or layout data.");
  }

  const words = rawWords
    .filter(isRecord)
    .map((item) => ({
      id: createId("word"),
      word: typeof item.word === "string" ? item.word : "",
      definition: typeof item.definition === "string" ? item.definition : ""
    }))
    .filter((item) => item.word.trim() || item.definition.trim());

  if (!words.length) {
    throw new Error("The selected file does not contain any words.");
  }

  const now = new Date().toISOString();
  const asNumber = (key: string, fallback: number) => {
    const nextValue = rawLayout[key];
    return typeof nextValue === "number" && Number.isFinite(nextValue) ? nextValue : fallback;
  };

  return {
    id: createId("sheet"),
    title: typeof value.title === "string" && value.title.trim() ? `${value.title.trim()} import` : "Imported vocabulary sheet",
    words,
    sourceType: "json",
    layout: {
      ...defaultLayout,
      paperSize: "A4",
      orientation: rawLayout.orientation === "landscape" ? "landscape" : "portrait",
      columns: Math.min(6, Math.max(1, asNumber("columns", defaultLayout.columns))),
      rows: Math.min(10, Math.max(1, asNumber("rows", defaultLayout.rows))),
      duplexMode: rawLayout.duplexMode === "manual" ? "manual" : "duplex",
      backSideLayout:
        rawLayout.backSideLayout === "auto" ||
        rawLayout.backSideLayout === "mirror-horizontal" ||
        rawLayout.backSideLayout === "mirror-vertical" ||
        rawLayout.backSideLayout === "none"
          ? rawLayout.backSideLayout
          : defaultLayout.backSideLayout,
      showCutLines: typeof rawLayout.showCutLines === "boolean" ? rawLayout.showCutLines : defaultLayout.showCutLines,
      frontFontSize: Math.min(48, Math.max(8, asNumber("frontFontSize", defaultLayout.frontFontSize))),
      backFontSize: Math.min(28, Math.max(6, asNumber("backFontSize", defaultLayout.backFontSize)))
    },
    createdAt: now,
    updatedAt: now
  };
}

export function SheetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const editId = searchParams.get("id");
  const initialSheet = useMemo(() => (editId ? getSheet(editId) : null), [editId]);
  const [sheet, setSheet] = useState<WordSheet>(() => initialSheet ?? createEmptySheet());
  const [bulkText, setBulkText] = useState("");
  const [importMessage, setImportMessage] = useState("");

  const validWords = sheet.words.filter((item) => item.word.trim() && item.definition.trim());

  function updateWord(id: string, patch: Partial<WordItem>) {
    setSheet((current) => ({
      ...current,
      words: current.words.map((item) => (item.id === id ? { ...item, ...patch } : item))
    }));
  }

  function parseText() {
    const parsed = parseBulkText(bulkText);
    setSheet((current) => ({
      ...current,
      sourceType: "paste",
      words: parsed.length ? parsed : current.words
    }));
  }

  function updateLayout(patch: Partial<WordSheet["layout"]>) {
    setSheet((current) => ({
      ...current,
      layout: { ...current.layout, ...patch }
    }));
  }

  function saveAndPreview() {
    const now = new Date().toISOString();
    const nextSheet: WordSheet = {
      ...sheet,
      title: sheet.title.trim() || "Untitled vocabulary sheet",
      words: validWords,
      updatedAt: now,
      createdAt: sheet.createdAt || now
    };

    saveSheet(nextSheet);
    router.push(`/preview/${nextSheet.id}`);
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const importedSheet = normalizeImportedSheet(JSON.parse(text));
      setSheet(importedSheet);
      setBulkText("");
      setImportMessage(`Imported "${importedSheet.title}" with ${importedSheet.words.length} words.`);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Could not import this JSON file.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create sheet</h1>
          <p className="mt-2 text-sm text-stone-600">
            Paste vocabulary pairs, adjust the A4 grid, then save a printable sheet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            onChange={importJson}
            className="hidden"
          />
          <Button onClick={() => importInputRef.current?.click()}>Import JSON</Button>
          <Button variant="primary" onClick={saveAndPreview} disabled={!validWords.length}>
            Save & Preview
          </Button>
        </div>
      </div>
      {importMessage ? (
        <div className="mb-5 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          {importMessage}
        </div>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-md border border-stone-200 bg-white p-4">
            <label className="block text-sm font-semibold" htmlFor="title">
              Sheet title
            </label>
            <input
              id="title"
              value={sheet.title}
              onChange={(event) => setSheet((current) => ({ ...current, title: event.target.value }))}
              className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2"
            />
          </div>

          <div className="rounded-md border border-stone-200 bg-white p-4">
            <label className="block text-sm font-semibold" htmlFor="bulk">
              Bulk paste
            </label>
            <textarea
              id="bulk"
              value={bulkText}
              onChange={(event) => setBulkText(event.target.value)}
              rows={8}
              placeholder={"aberration - a departure from what is normal\nbenevolent: well meaning and kindly\ncandid,truthful and straightforward"}
              className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={parseText}>Parse</Button>
              <Button
                onClick={() => setSheet((current) => ({ ...current, words: removeDuplicateWords(current.words) }))}
              >
                Remove duplicates
              </Button>
              <Button
                onClick={() =>
                  setSheet((current) => ({
                    ...current,
                    words: [...current.words].sort((a, b) => a.word.localeCompare(b.word))
                  }))
                }
              >
                Sort A-Z
              </Button>
              <Button variant="danger" onClick={() => setSheet((current) => ({ ...current, words: [] }))}>
                Clear all
              </Button>
            </div>
          </div>

          <div className="rounded-md border border-stone-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Words ({validWords.length})</h2>
              <Button onClick={() => setSheet((current) => ({ ...current, words: [...current.words, createBlankRow()] }))}>
                Add row
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-stone-50 text-left">
                    <th className="p-2 font-semibold">Word</th>
                    <th className="p-2 font-semibold">Definition</th>
                    <th className="w-24 p-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.words.map((item) => (
                    <tr key={item.id} className="border-b border-stone-100">
                      <td className="p-2">
                        <input
                          value={item.word}
                          onChange={(event) => updateWord(item.id, { word: event.target.value })}
                          className="w-full rounded border border-stone-300 px-2 py-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={item.definition}
                          onChange={(event) => updateWord(item.id, { definition: event.target.value })}
                          className="w-full rounded border border-stone-300 px-2 py-1"
                        />
                      </td>
                      <td className="p-2">
                        <Button
                          variant="danger"
                          onClick={() =>
                            setSheet((current) => ({
                              ...current,
                              words: current.words.filter((word) => word.id !== item.id)
                            }))
                          }
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-md border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Layout settings</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Paper size
              <select className="mt-1 w-full rounded-md border border-stone-300 px-2 py-2" value="A4" disabled>
                <option>A4</option>
              </select>
            </label>
            <label className="text-sm">
              Orientation
              <select
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-2"
                value={sheet.layout.orientation}
                onChange={(event) => updateLayout({ orientation: event.target.value as WordSheet["layout"]["orientation"] })}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </label>
            <label className="text-sm">
              Columns
              <input
                type="number"
                min={1}
                max={6}
                value={sheet.layout.columns}
                onChange={(event) => updateLayout({ columns: Number(event.target.value) })}
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-2"
              />
            </label>
            <label className="text-sm">
              Rows
              <input
                type="number"
                min={1}
                max={10}
                value={sheet.layout.rows}
                onChange={(event) => updateLayout({ rows: Number(event.target.value) })}
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-2"
              />
            </label>
            <label className="text-sm">
              Duplex mode
              <select
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-2"
                value={sheet.layout.duplexMode}
                onChange={(event) => updateLayout({ duplexMode: event.target.value as WordSheet["layout"]["duplexMode"] })}
              >
                <option value="duplex">Duplex</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <label className="text-sm">
              Back side alignment
              <select
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-2"
                value={sheet.layout.backSideLayout}
                onChange={(event) =>
                  updateLayout({ backSideLayout: event.target.value as WordSheet["layout"]["backSideLayout"] })
                }
              >
                <option value="auto">Auto</option>
                <option value="mirror-horizontal">Mirror horizontal</option>
                <option value="mirror-vertical">Mirror vertical</option>
                <option value="none">None</option>
              </select>
            </label>
            <label className="text-sm">
              Front font size
              <input
                type="number"
                min={8}
                max={48}
                value={sheet.layout.frontFontSize}
                onChange={(event) => updateLayout({ frontFontSize: Number(event.target.value) })}
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-2"
              />
            </label>
            <label className="text-sm">
              Back font size
              <input
                type="number"
                min={6}
                max={28}
                value={sheet.layout.backFontSize}
                onChange={(event) => updateLayout({ backFontSize: Number(event.target.value) })}
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={sheet.layout.showCutLines}
                onChange={(event) => updateLayout({ showCutLines: event.target.checked })}
              />
              Show dashed cut lines
            </label>
          </div>
        </aside>
      </section>
    </main>
  );
}
