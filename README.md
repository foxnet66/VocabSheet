# VocabSheet

VocabSheet is a browser-only A4 vocabulary card sheet generator. It helps users create printable double-sided vocabulary cards, with English words on the front and English definitions on the back.

The app uses Next.js App Router, TypeScript, Tailwind CSS, and browser `localStorage`. It has no backend, no database, no authentication, and no external AI API dependency.

## Features

- Create vocabulary sheets from bulk pasted text.
- Parse common word-definition formats:
  - `word - definition`
  - `word: definition`
  - `word,definition`
  - `word<TAB>definition`
  - `word;definition`
  - CSV with header: `word,definition`
- Edit words and definitions in a table.
- Add and delete rows.
- Remove duplicate words.
- Sort words A-Z.
- Save sheets to browser `localStorage`.
- Preview printable A4 pages.
- Generate double-sided print order:
  - Front page 1
  - Back page 1
  - Front page 2
  - Back page 2
- Mirror back-side layout horizontally by default for duplex printing.
- Print duplex, front-only, or back-only.
- View, edit, duplicate, export, and delete saved sheets from history.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- Browser `localStorage`

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js will choose another available port.

## Scripts

```bash
npm run dev
```

Starts the local development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server after a build.

```bash
npm run lint
```

Runs TypeScript checking with `tsc --noEmit`.

```bash
npm run typecheck
```

Runs TypeScript checking with `tsc --noEmit`.

## Routes

- `/` - Home page
- `/create` - Create or edit a vocabulary sheet
- `/preview/[id]` - Print preview for a saved sheet
- `/history` - Saved sheet history

## Project Structure

```text
app/
  create/
  history/
  preview/
  globals.css
  layout.tsx
  page.tsx
components/
  Button.tsx
  HistoryList.tsx
  PrintPreview.tsx
  SheetForm.tsx
lib/
  id.ts
  parser.ts
  printLayout.ts
  storage.ts
types/
  index.ts
```

## Data Storage

All sheets are stored in browser `localStorage` under this key:

```text
vocabsheet.sheets.v1
```

Because there is no backend, saved sheets are local to the current browser and device.

## Data Model

```ts
type WordItem = {
  id: string;
  word: string;
  definition: string;
};

type WordSheet = {
  id: string;
  title: string;
  words: WordItem[];
  sourceType: "paste" | "csv" | "txt" | "json" | "manual";
  layout: {
    paperSize: "A4";
    orientation: "portrait" | "landscape";
    columns: number;
    rows: number;
    duplexMode: "duplex" | "manual";
    backSideLayout: "auto" | "mirror-horizontal" | "mirror-vertical" | "none";
    showCutLines: boolean;
    frontFontSize: number;
    backFontSize: number;
  };
  createdAt: string;
  updatedAt: string;
};
```

## Printing Notes

For best results:

- Paper size: A4
- Scale: 100%
- Two-sided printing: On
- Flip on long edge
- Browser print margins: none or default, depending on printer behavior

The app uses CSS `@page`, millimeter units, fixed A4 page dimensions, and dashed cut lines for card cutting.

For A4 portrait, the page is `210mm x 297mm` with `10mm` padding, giving a printable grid area of about `190mm x 277mm`.

## Current Limitations

- Sheets are not synced across devices.
- There is no import JSON flow yet, only export JSON.
- Browser and printer drivers may render print margins differently, so a physical test print is recommended before printing large batches.
