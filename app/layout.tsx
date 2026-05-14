import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VocabSheet",
  description: "Create printable double-sided vocabulary cards on A4 paper."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="no-print border-b border-line bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              VocabSheet
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/create" className="hover:underline">
                Create
              </Link>
              <Link href="/history" className="hover:underline">
                History
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
