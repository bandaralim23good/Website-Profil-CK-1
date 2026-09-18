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
    const body = await request.json();

    const sku = await prisma.sKU.update({
      where: {
        id: Number(id),
      },
      data: {
        factoryId: Number(body.factoryId),
        code: body.code?.trim(),
        name: body.name?.trim(),
      },
    });

    return NextResponse.json(sku);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal mengubah SKU." },
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

    await prisma.sKU.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "SKU berhasil dihapus.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal menghapus SKU." },
      { status: 500 }
    );
  }
}