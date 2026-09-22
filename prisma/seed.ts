import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const months = [
  // 2025
  { month: 1, year: 2025 },
  { month: 2, year: 2025 },
  { month: 3, year: 2025 },
  { month: 4, year: 2025 },
  { month: 5, year: 2025 },
  { month: 6, year: 2025 },
  { month: 7, year: 2025 },
  { month: 8, year: 2025 },
  { month: 9, year: 2025 },
  { month: 10, year: 2025 },
  { month: 11, year: 2025 },
  { month: 12, year: 2025 },

  // 2026
  { month: 1, year: 2026 },
  { month: 2, year: 2026 },
  { month: 3, year: 2026 },
  { month: 4, year: 2026 },
  { month: 5, year: 2026 },
  { month: 6, year: 2026 },
  { month: 7, year: 2026 },
];
const overallScores = [
  // 2025
  null,   // Jan
  54.00,  // Feb
  60.20,  // Mar
  65.28,  // Apr
  66.47,  // Mei
  56.33,  // Jun
  65.61,  // Jul
  66.95,  // Agu
  72.32,  // Sep
  66.84,  // Okt
  79.84,  // Nov
  72.57,  // Des

  // 2026
  78.68,  // Jan
  78.60,  // Feb
  78.48,  // Mar
  79.86,  // Apr
  79.26,  // Mei
  73.75,  // Jun
  79.33,  // Jul
];

const skuData = [
  // =========================
  // PENTOL
  // =========================
  {
    code: "PT",
    name: "Pentol",
    scores: [
      // 2025
      null,   // Jan
      52.00,  // Feb
      70.53,  // Mar
      61.61,  // Apr
      66.15,  // Mei
      50.84,  // Jun
      61.30,  // Jul
      70.57,  // Agu
      77.08,  // Sep
      61.13,  // Okt
      69.87,  // Nov
      62.88,  // Des

      // 2026
      65.35,  // Jan
      74.27,  // Feb
      79.02,  // Mar
      78.08,  // Apr
      null,   // Mei
      null,   // Jun
      null,   // Jul
    ],
  },

  // =========================
  // LUMPIA
  // =========================
  {
    code: "LM",
    name: "Lumpia",
    scores: [
      // 2025
      null,   // Jan
      36.00,  // Feb
      56.33,  // Mar
      51.41,  // Apr
      47.66,  // Mei
      48.99,  // Jun
      44.41,  // Jul
      46.75,  // Agu
      68.33,  // Sep
      64.33,  // Okt
      84.33,  // Nov
      64.67,  // Des

      // 2026
      79.83,  // Jan
      74.83,  // Feb
      65.00,  // Mar
      71.67,  // Apr
      78.33,  // Mei
      73.75,  // Jun
      79.00,  // Jul
    ],
  },

  // =========================
  // SIOMAY MANUAL
  // =========================
  {
    code: "SM",
    name: "Siomay Manual",
    scores: [
      // 2025
      null,   // Jan
      54.00,  // Feb
      65.33,  // Mar
      61.16,  // Apr
      68.33,  // Mei
      56.33,  // Jun
      81.50,  // Jul
      78.33,  // Agu
      84.17,  // Sep
      78.33,  // Okt
      87.58,  // Nov
      null,   // Des

      // 2026
      null,   // Jan
      null,   // Feb
      null,   // Mar
      null,   // Apr
      null,   // Mei
      null,   // Jun
      null,   // Jul
    ],
  },

  // =========================
  // ADONAN PANGSIT
  // =========================
  {
    code: "AP",
    name: "Adonan Pangsit",
    scores: [
      // 2025
      null,   // Jan
      12.00,  // Feb
      71.84,  // Mar
      86.92,  // Apr
      83.74,  // Mei
      69.14,  // Jun
      75.24,  // Jul
      72.16,  // Agu
      59.69,  // Sep
      75.42,  // Okt
      81.42,  // Nov
      82.50,  // Des

      // 2026
      73.33,  // Jan
      84.17,  // Feb
      81.25,  // Mar
      85.33,  // Apr
      80.64,  // Mei
      null,   // Jun
      79.67,  // Jul
    ],
  },

  // =========================
  // UDANG KEJU FROZEN
  // =========================
  {
    code: "UK",
    name: "Udang Keju Frozen",
    scores: [
      // 2025
      null,   // Jan
      null,   // Feb
      null,   // Mar
      null,   // Apr
      null,   // Mei
      null,   // Jun
      null,   // Jul
      null,   // Agu
      null,   // Sep
      55.00,  // Okt
      76.00,  // Nov
      80.22,  // Des

      // 2026
      96.22,  // Jan
      81.11,  // Feb
      88.67,  // Mar
      84.38,  // Apr
      75.75,  // Mei
      null,   // Jun
      null,   // Jul
    ],
  },
];

async function main() {
  // =========================
  // 1. USER
  // =========================

  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@company.com",
    },
    update: {
      name: "Administrator",
      password: adminPassword,
      role: "ADMIN",
    },
    create: {
      name: "Administrator",
      email: "admin@company.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: {
      email: "user@company.com",
    },
    update: {
      name: "User CK-1",
      password: userPassword,
      role: "USER",
    },
    create: {
      name: "User CK-1",
      email: "user@company.com",
      password: userPassword,
      role: "USER",
    },
  });

  // =========================
  // 2. FACTORY CK-1
  // =========================

  const factory = await prisma.factory.upsert({
    where: {
      code: "CK1",
    },
    update: {
      name: "Central Kitchen 1",
    },
    create: {
      code: "CK1",
      name: "Central Kitchen 1",
    },
  });

  // =========================
  // RESET MANUFACTURING SCORE
  // =========================

  await prisma.manufacturingScoreSKU.deleteMany({
    where: {
      manufacturingScore: {
        factoryId: factory.id,
      },
    },
  });

  await prisma.manufacturingScore.deleteMany({
    where: {
      factoryId: factory.id,
    },
  });

  // =========================
  // 3. SKU
  // =========================

  const skus = [];

  for (const item of skuData) {
    const sku = await prisma.sKU.upsert({
      where: {
        factoryId_code: {
          factoryId: factory.id,
          code: item.code,
        },
      },
      update: {
        name: item.name,
      },
      create: {
        factoryId: factory.id,
        code: item.code,
        name: item.name,
      },
    });

    skus.push({
      ...sku,
      scores: item.scores,
    });
  }

  // =========================================================
  // 4. MANUFACTURING SCORE
  // =========================================================

  for (const [index, period] of months.entries()) {
    const availableScores = skus
      .map((sku) => ({
        skuId: sku.id,
        score: sku.scores[index],
      }))
      .filter(
        (
          item
        ): item is {
          skuId: number;
          score: number;
        } => item.score !== undefined && item.score !== null
      );

    const overallScore = overallScores[index];

    // Jika overall kosong, berarti tidak ada report
    // untuk periode tersebut.
    if (overallScore === null || overallScore === undefined) {
      continue;
    }

    const manufacturingScore =
      await prisma.manufacturingScore.upsert({
        where: {
          factoryId_month_year: {
            factoryId: factory.id,
            month: period.month,
            year: period.year,
          },
        },
        update: {
          score: overallScore,
        },
        create: {
          factoryId: factory.id,
          month: period.month,
          year: period.year,
          score: overallScore,
        },
      });

    // =========================
    // SKU SCORE
    // =========================

    for (const item of availableScores) {
      await prisma.manufacturingScoreSKU.upsert({
        where: {
          manufacturingScoreId_skuId: {
            manufacturingScoreId: manufacturingScore.id,
            skuId: item.skuId,
          },
        },
        update: {
          score: item.score,
        },
        create: {
          manufacturingScoreId: manufacturingScore.id,
          skuId: item.skuId,
          score: item.score,
        },
      });
    }
  }

  // =========================
  // 5. LOG
  // =========================

  console.log("\n==============================");
  console.log("SEED BERHASIL");
  console.log("==============================");

  console.log("Admin:", {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });

  console.log("User:", {
    id: user.id,
    email: user.email,
    role: user.role,
  });

  console.log("Factory:", {
    id: factory.id,
    code: factory.code,
    name: factory.name,
  });

  console.log(
    "SKU:",
    skus.map((sku) => ({
      id: sku.id,
      code: sku.code,
      name: sku.name,
    }))
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });