import { redirect } from "next/navigation";
import { WebPresentation } from "@/components/reports/WebPresentation";
import { loadFreshReport } from "@/lib/analysis/report/reportLoader";
import { getSessionUser } from "@/lib/auth/session";

export default async function PrivatePresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/present/reports/${id}`)}`);
  const report = await loadFreshReport(id, user.id);
  return <WebPresentation report={report} closeHref={`/reports/${id}`} />;
}
