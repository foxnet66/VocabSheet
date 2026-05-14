"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { alignBackPage, getCardsPerPage, paginateWords } from "@/lib/printLayout";
import { getSheet } from "@/lib/storage";
import type { WordItem, WordSheet } from "@/types";

function PrintablePage({
  sheet,
  words,
  side,
  pageNumber
}: {
  sheet: WordSheet;
  words: Array<WordItem | null>;
  side: "front" | "back";
  pageNumber: number;
}) {
  const isFront = side === "front";
  const pageClass = isFront ? "front-page" : "back-page";
  const pageSize =
    sheet.layout.orientation === "landscape"
      ? { width: "297mm", height: "210mm" }
      : { width: "210mm", height: "297mm" };

  return (
    <section
      className={`a4-page print-page ${pageClass}`}
      style={pageSize}
      aria-label={`${isFront ? "Front" : "Back"} page ${pageNumber}`}
    >
      <CardGrid sheet={sheet} words={words} side={side} pageNumber={pageNumber} />
    </section>
  );
}

function CardGrid({
  sheet,
  words,
  side,
  pageNumber
}: {
  sheet: WordSheet;
  words: Array<WordItem | null>;
  side: "front" | "back";
  pageNumber: number;
}) {
  const isFront = side === "front";

  return (
    <div
      className={`card-grid ${sheet.layout.showCutLines ? "cut-lines" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${sheet.layout.columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${sheet.layout.rows}, minmax(0, 1fr))`
      }}
    >
      {words.map((item, index) => (
        <div
          key={`${side}-${pageNumber}-${item?.id ?? index}`}
          className="card-cell flex items-center justify-center p-[5mm] text-center"
        >
          {item ? (
            <div
              className={isFront ? "font-semibold leading-tight" : "leading-snug"}
              style={{
                fontSize: `${isFront ? sheet.layout.frontFontSize : sheet.layout.backFontSize}pt`
              }}
            >
              {isFront ? item.word : item.definition}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DuplexPrintDocument({ sheet, pages }: { sheet: WordSheet; pages: WordItem[][] }) {
  return (
    <div className="mx-auto w-fit">
      {pages.map((pageWords, index) => {
        const cells = Array.from(
          { length: getCardsPerPage(sheet) },
          (_, cellIndex) => pageWords[cellIndex] ?? null
        );

        return (
          <div key={`sheet-page-${index}`}>
            <div className="screen-only mb-2 text-sm font-semibold text-stone-600">
              Front page {index + 1}
            </div>
            <PrintablePage sheet={sheet} words={cells} side="front" pageNumber={index + 1} />
            <div className="screen-only mb-2 text-sm font-semibold text-stone-600">
              Back page {index + 1}
            </div>
            <PrintablePage
              sheet={sheet}
              words={alignBackPage(pageWords, sheet)}
              side="back"
              pageNumber={index + 1}
            />
          </div>
        );
      })}
    </div>
  );
}

export function PrintPreview({ id }: { id: string }) {
  const [sheet, setSheet] = useState<WordSheet | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const stored = getSheet(id);
    setSheet(stored);
    setMissing(!stored);
  }, [id]);

  const pages = useMemo(() => {
    if (!sheet) {
      return [];
    }

    return paginateWords(sheet.words, getCardsPerPage(sheet));
  }, [sheet]);

  function printMode(mode: "duplex" | "front" | "back") {
    document.body.classList.remove("print-front-only", "print-back-only");
    if (mode === "front") {
      document.body.classList.add("print-front-only");
    }
    if (mode === "back") {
      document.body.classList.add("print-back-only");
    }
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove("print-front-only", "print-back-only");
    }, 400);
  }

  if (missing) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="text-2xl font-semibold">Sheet not found</h1>
        <p className="mt-2 text-stone-600">This sheet is not available in this browser&apos;s localStorage.</p>
        <Link className="mt-5 inline-block rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" href="/create">
          Create a new sheet
        </Link>
      </main>
    );
  }

  if (!sheet) {
    return <main className="px-5 py-8">Loading...</main>;
  }

  return (
    <main className="print-root bg-paper px-5 py-8">
      <div className="no-print mx-auto mb-6 max-w-6xl">
        <div className="flex flex-col gap-4 rounded-md border border-stone-200 bg-white p-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{sheet.title}</h1>
            <p className="mt-1 text-sm text-stone-600">
              {sheet.words.length} words · {sheet.layout.columns} x {sheet.layout.rows} · A4 {sheet.layout.orientation}
            </p>
            <div className="mt-4 text-sm text-stone-700">
              <p className="font-semibold text-ink">Printing instructions</p>
              <p>Paper size: A4</p>
              <p>Scale: 100%</p>
              <p>Two-sided printing: On</p>
              <p>Flip on long edge</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => printMode("duplex")}>
              Print Duplex
            </Button>
            <Button onClick={() => printMode("front")}>Print Front Only</Button>
            <Button onClick={() => printMode("back")}>Print Back Only</Button>
            <Link className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold" href={`/create?id=${sheet.id}`}>
              Edit
            </Link>
          </div>
        </div>
      </div>

      <DuplexPrintDocument sheet={sheet} pages={pages} />
    </main>
  );
}
