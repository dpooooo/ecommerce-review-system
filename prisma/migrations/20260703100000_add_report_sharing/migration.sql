ALTER TABLE "AnalysisReport"
ADD COLUMN "shareToken" TEXT,
ADD COLUMN "sharedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "AnalysisReport_shareToken_key" ON "AnalysisReport"("shareToken");
