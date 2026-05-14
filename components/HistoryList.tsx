"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { createId } from "@/lib/id";
import { deleteSheet, exportSheet, getSheets, saveSheet } from "@/lib/storage";
import type { WordSheet } from "@/types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

export function HistoryList() {
  const [sheets, setSheets] = useState<WordSheet[]>([]);

  function refresh() {
    setSheets(getSheets());
  }

  useEffect(() => {
    refresh();
  }, []);

  function duplicateSheet(sheet: WordSheet) {
    const now = new Date().toISOString();
    saveSheet({
      ...sheet,
      id: createId("sheet"),
      title: `${sheet.title} copy`,
      words: sheet.words.map((word) => ({ ...word, id: createId("word") })),
      createdAt: now,
      updatedAt: now
    });
    refresh();
  }

  function removeSheet(id: string) {
    const confirmed = window.confirm("Delete this sheet from localStorage?");
    if (!confirmed) {
      return;
    }
    deleteSheet(id);
    refresh();
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">History</h1>
          <p className="mt-2 text-sm text-stone-600">Saved sheets are stored only in this browser.</p>
        </div>
        <Link className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" href="/create">
          Create New Sheet
        </Link>
      </div>

      {!sheets.length ? (
        <div className="rounded-md border border-stone-200 bg-white p-8 text-center">
          <p className="text-stone-600">No saved sheets yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-stone-200 bg-white">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-stone-50 text-left">
                <th className="p-3 font-semibold">Title</th>
                <th className="p-3 font-semibold">Word count</th>
                <th className="p-3 font-semibold">Layout</th>
                <th className="p-3 font-semibold">Created</th>
                <th className="p-3 font-semibold">Updated</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sheets.map((sheet) => (
                <tr key={sheet.id} className="border-b border-stone-100 align-top">
                  <td className="p-3 font-medium">{sheet.title}</td>
                  <td className="p-3">{sheet.words.length}</td>
                  <td className="p-3">
                    A4 {sheet.layout.orientation}, {sheet.layout.columns} x {sheet.layout.rows}
                  </td>
                  <td className="p-3">{formatDate(sheet.createdAt)}</td>
                  <td className="p-3">{formatDate(sheet.updatedAt)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold"
                        href={`/preview/${sheet.id}`}
                      >
                        Open Preview
                      </Link>
                      <Link
                        className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold"
                        href={`/create?id=${sheet.id}`}
                      >
                        Edit
                      </Link>
                      <Button onClick={() => duplicateSheet(sheet)}>Duplicate</Button>
                      <Button onClick={() => exportSheet(sheet)}>Export JSON</Button>
                      <Button variant="danger" onClick={() => removeSheet(sheet.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
