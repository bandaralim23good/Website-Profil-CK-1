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

    const factories = await prisma.factory.findMany({
        include: {
            skus: {
                orderBy: {
                    code: "asc",
                },
            },
        },
        orderBy: {
            code: "asc",
        },
    });

    return NextResponse.json(factories);
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

        const code = body.code?.trim();
        const name = body.name?.trim();

        if (!code || !name) {
            return NextResponse.json(
                { message: "Code dan name wajib diisi." },
                { status: 400 }
            );
        }

        const factory = await prisma.factory.create({
            data: {
                code,
                name,
            },
        });

        return NextResponse.json(factory, { status: 201 });
    } catch (error) {
        console.error("CREATE FACTORY ERROR:", error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Gagal membuat factory.",
            },
            { status: 500 }
        );
    }
}