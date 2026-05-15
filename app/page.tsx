import Link from "next/link";

const steps = [
  "Paste word pairs",
  "Adjust A4 grid",
  "Print duplex cards"
];

const details = [
  { label: "Paper", value: "A4" },
  { label: "Default grid", value: "3 x 4" },
  { label: "Storage", value: "Local only" }
];

const previewWords = [
  "aberration",
  "benevolent",
  "candid",
  "diligent",
  "empathy",
  "frugal"
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <section className="grid min-h-[calc(100vh-180px)] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-600">
            Vocabulary card sheet generator
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
            VocabSheet
          </h1>
          <p className="mt-5 max-w-xl text-xl leading-8 text-stone-700">
            Create printable double-sided vocabulary cards on A4 paper.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              Create New Sheet
            </Link>
            <Link
              href="/history"
              className="rounded-md border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              View History
            </Link>
          </div>

          <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            {details.map((item) => (
              <div key={item.label} className="border-l border-stone-300 pl-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                  {item.label}
                </div>
                <div className="mt-1 text-lg font-semibold text-ink">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[520px]">
          <div className="rounded-md border border-stone-200 bg-white p-4 shadow-[0_16px_40px_rgb(23_32_38_/_0.12)]">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
              <span>Print preview</span>
              <span>Front side</span>
            </div>
            <div className="aspect-[210/297] bg-white p-[7%] ring-1 ring-stone-200">
              <div className="grid h-full grid-cols-3 grid-rows-4">
                {Array.from({ length: 12 }, (_, index) => (
                  <div
                    key={index}
                    className="flex min-h-0 min-w-0 items-center justify-center border border-dashed border-slate-400 p-2 text-center"
                  >
                    {previewWords[index] ? (
                      <span className="text-sm font-semibold text-ink sm:text-base">
                        {previewWords[index]}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-md border border-stone-200 bg-white px-4 py-3">
                <div className="text-xs font-semibold text-stone-500">0{index + 1}</div>
                <div className="mt-1 text-sm font-semibold text-ink">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
