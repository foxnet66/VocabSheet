import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-5xl flex-col items-start justify-center px-5 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-stone-600">
        Vocabulary card sheet generator
      </p>
      <h1 className="text-5xl font-semibold tracking-tight text-ink sm:text-7xl">
        VocabSheet
      </h1>
      <p className="mt-5 max-w-2xl text-xl leading-8 text-stone-700">
        Create printable double-sided vocabulary cards on A4 paper.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
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
    </main>
  );
}
