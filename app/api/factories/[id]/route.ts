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

    const factory = await prisma.factory.update({
      where: {
        id: Number(id),
      },
      data: {
        code: body.code?.trim(),
        name: body.name?.trim(),
      },
    });

    return NextResponse.json(factory);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal mengubah factory." },
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

    await prisma.factory.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Factory berhasil dihapus.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal menghapus factory." },
      { status: 500 }
    );
  }
}