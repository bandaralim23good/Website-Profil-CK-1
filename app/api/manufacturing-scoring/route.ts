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

    const result = await prisma.manufacturingScore.create({
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
        },
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal membuat manufacturing score." },
      { status: 500 }
    );
  }
}