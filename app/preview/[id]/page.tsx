import { PrintPreview } from "@/components/PrintPreview";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PrintPreview id={id} />;
}
