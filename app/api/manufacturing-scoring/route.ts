import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const scores = await prisma.manufacturingScore.findMany({
    include: {
      factory: true,
      skuScores: {
        include: {
          sku: true,
        },
        orderBy: {
          sku: {
            code: "asc",
          },
        },
      },
    },
    orderBy: [
      {
        year: "desc",
      },
      {
        month: "desc",
      },
    ],
  });

  return NextResponse.json(scores);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const factoryId = Number(body.factoryId);
    const month = Number(body.month);
    const year = Number(body.year);
    const score = Number(body.score);

    if (
      !factoryId ||
      !month ||
      !year ||
      Number.isNaN(score)
    ) {
      return NextResponse.json(
        { message: "Data scoring tidak lengkap." },
        { status: 400 }
      );
    }

    const skuScores = Array.isArray(body.skuScores)
      ? body.skuScores
      : [];

    const existingScore =
      await prisma.manufacturingScore.findUnique({
        where: {
          factoryId_month_year: {
            factoryId,
            month,
            year,
          },
        },
      });

    let result;

    if (existingScore) {
      // Update overall score yang sudah ada
      result = await prisma.manufacturingScore.update({
        where: {
          id: existingScore.id,
        },

        data: {
          score,

          skuScores: {
            upsert: skuScores.map(
              (item: {
                skuId: number;
                score: number;
              }) => ({
                where: {
                  manufacturingScoreId_skuId: {
                    manufacturingScoreId: existingScore.id,
                    skuId: Number(item.skuId),
                  },
                },

                update: {
                  score: Number(item.score),
                },

                create: {
                  skuId: Number(item.skuId),
                  score: Number(item.score),
                },
              })
            ),
          },
        },

        include: {
          factory: true,
          skuScores: {
            include: {
              sku: true,
            },
            orderBy: {
              sku: {
                code: "asc",
              },
            },
          },
        },
      });
    } else {
      // Belum ada data → buat baru
      result = await prisma.manufacturingScore.create({
        data: {
          factoryId,
          month,
          year,
          score,

          skuScores: {
            create: skuScores.map(
              (item: {
                skuId: number;
                score: number;
              }) => ({
                skuId: Number(item.skuId),
                score: Number(item.score),
              })
            ),
          },
        },

        include: {
          factory: true,
          skuScores: {
            include: {
              sku: true,
            },
            orderBy: {
              sku: {
                code: "asc",
              },
            },
          },
        },
      });
    }

    return NextResponse.json(result, {
      status: existingScore ? 200 : 201,
    });
  } catch (error) {
    console.error("MANUFACTURING SCORE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan manufacturing score.",
      },
      { status: 500 }
    );
  }
}