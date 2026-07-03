import { notFound } from "next/navigation";
import { WebPresentation } from "@/components/reports/WebPresentation";
import { loadSharedReport } from "@/lib/analysis/report/reportLoader";

export default async function SharedPresentationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await loadSharedReport(token);
  if (!report) notFound();
  return <WebPresentation report={report} />;
}
