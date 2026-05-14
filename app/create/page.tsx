import { Suspense } from "react";
import { SheetForm } from "@/components/SheetForm";

export default function CreatePage() {
  return (
    <Suspense fallback={<main className="px-5 py-8">Loading...</main>}>
      <SheetForm />
    </Suspense>
  );
}
