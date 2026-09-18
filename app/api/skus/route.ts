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

  const skus = await prisma.sKU.findMany({
    include: {
      factory: true,
    },
    orderBy: {
      code: "asc",
    },
  });

  return NextResponse.json(skus);
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
    const code = body.code?.trim();
    const name = body.name?.trim();

    if (!factoryId || !code || !name) {
      return NextResponse.json(
        { message: "Factory, code, dan name wajib diisi." },
        { status: 400 }
      );
    }

    const sku = await prisma.sKU.create({
      data: {
        factoryId,
        code,
        name,
      },
    });

    return NextResponse.json(sku, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal membuat SKU." },
      { status: 500 }
    );
  }
}