import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function ReportsPage() {
  const user = await getSessionUser();
  const shops = user
    ? await prisma.shop.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, platform: true }
      })
    : [];

  return <ReportGenerator shops={shops} />;
}
