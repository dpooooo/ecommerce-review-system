import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function ReportsPage() {
  const user = await getSessionUser();
  const [shops, latestCurrentBatch, latestPreviousBatch, recentReports] = user
    ? await Promise.all([
        prisma.shop.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, platform: true }
        }),
        prisma.uploadBatch.findFirst({
          where: { userId: user.id, periodType: "current", status: { not: "failed" } },
          orderBy: { periodEnd: "desc" },
          select: { periodStart: true, periodEnd: true }
        }),
        prisma.uploadBatch.findFirst({
          where: { userId: user.id, periodType: "previous", status: { not: "failed" } },
          orderBy: { periodEnd: "desc" },
          select: { periodStart: true, periodEnd: true }
        }),
        prisma.analysisReport.findMany({
          where: { userId: user.id },
          include: { shop: true },
          orderBy: { createdAt: "desc" },
          take: 6
        })
      ])
    : [[], null, null, []];

  return (
    <ReportGenerator
      shops={shops}
      defaultPeriod={{
        currentStart: latestCurrentBatch?.periodStart.toISOString().slice(0, 10),
        currentEnd: latestCurrentBatch?.periodEnd.toISOString().slice(0, 10),
        previousStart: latestPreviousBatch?.periodStart.toISOString().slice(0, 10),
        previousEnd: latestPreviousBatch?.periodEnd.toISOString().slice(0, 10)
      }}
      recentReports={recentReports.map((report) => ({
        id: report.id,
        title: report.title,
        shopName: report.shop.name,
        period: `${report.currentStart.toISOString().slice(0, 10)} 至 ${report.currentEnd.toISOString().slice(0, 10)}`,
        createdAt: report.createdAt.toISOString()
      }))}
    />
  );
}
