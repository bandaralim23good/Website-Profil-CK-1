-- CreateTable
CREATE TABLE "kpis" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_annual_metrics" (
    "id" SERIAL NOT NULL,
    "kpiId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "actual" DECIMAL(14,4),
    "target" DECIMAL(14,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_annual_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_actuals" (
    "id" SERIAL NOT NULL,
    "kpiId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "value" DECIMAL(14,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_actuals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kpis_code_key" ON "kpis"("code");

-- CreateIndex
CREATE INDEX "kpi_annual_metrics_year_idx" ON "kpi_annual_metrics"("year");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_annual_metrics_kpiId_year_key" ON "kpi_annual_metrics"("kpiId", "year");

-- CreateIndex
CREATE INDEX "kpi_actuals_year_month_idx" ON "kpi_actuals"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_actuals_kpiId_year_month_key" ON "kpi_actuals"("kpiId", "year", "month");

-- AddForeignKey
ALTER TABLE "kpi_annual_metrics" ADD CONSTRAINT "kpi_annual_metrics_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "kpis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_actuals" ADD CONSTRAINT "kpi_actuals_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "kpis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
