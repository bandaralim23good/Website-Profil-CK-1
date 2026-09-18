import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: Params
) {
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
    const { id } = await params;
    const scoreId = Number(id);
    const body = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.manufacturingScore.update({
        where: {
          id: scoreId,
        },
        data: {
          factoryId: Number(body.factoryId),
          month: Number(body.month),
          year: Number(body.year),
          score: Number(body.score),
        },
      });

      if (Array.isArray(body.skuScores)) {
        await tx.manufacturingScoreSKU.deleteMany({
          where: {
            manufacturingScoreId: scoreId,
          },
        });

        if (body.skuScores.length > 0) {
          await tx.manufacturingScoreSKU.createMany({
            data: body.skuScores.map(
              (item: {
                skuId: number;
                score: number;
              }) => ({
                manufacturingScoreId: scoreId,
                skuId: Number(item.skuId),
                score: Number(item.score),
              })
            ),
          });
        }
      }

      return tx.manufacturingScore.findUnique({
        where: {
          id: scoreId,
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
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal mengubah scoring." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
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
    const { id } = await params;

    await prisma.manufacturingScore.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Scoring berhasil dihapus.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal menghapus scoring." },
      { status: 500 }
    );
  }
}