export type WordItem = {
  id: string;
  word: string;
  definition: string;
};

export type WordSheet = {
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

export type PrintableSide = "front" | "back";
