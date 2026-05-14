import type { WordItem } from "@/types";
import { createId } from "@/lib/id";

type ParsedLine = {
  word: string;
  definition: string;
};

const DELIMITERS = ["\t", " - ", ":", ",", ";"];

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function splitLine(line: string): ParsedLine | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  for (const delimiter of DELIMITERS) {
    if (trimmed.includes(delimiter)) {
      const [word, ...rest] =
        delimiter === "," ? parseCsvLine(trimmed) : trimmed.split(delimiter);
      const definition = rest.join(delimiter).trim();
      if (word?.trim() && definition) {
        return { word: word.trim(), definition };
      }
    }
  }

  return null;
}

export function parseBulkText(input: string): WordItem[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const hasCsvHeader = /^"?word"?\s*,\s*"?definition"?$/i.test(lines[0] ?? "");
  const dataLines = hasCsvHeader ? lines.slice(1) : lines;

  return dataLines
    .map(splitLine)
    .filter((item): item is ParsedLine => Boolean(item))
    .map((item) => ({
      id: createId("word"),
      word: item.word,
      definition: item.definition
    }));
}

export function removeDuplicateWords(words: WordItem[]) {
  const seen = new Set<string>();
  return words.filter((item) => {
    const key = item.word.trim().toLocaleLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
