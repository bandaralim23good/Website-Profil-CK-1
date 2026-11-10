
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET: Mengambil seluruh master KPI
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const data = await prisma.kPI.findMany({
            orderBy: {
                id: "asc",
            },
        });

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("GET KPI ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Gagal mengambil data KPI" },
            { status: 500 }
        );
    }
}

// POST: Menambahkan master KPI
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await req.json();

        const { code, name, unit, description } = body;

        if (
            typeof code !== "string" ||
            !code.trim() ||
            typeof name !== "string" ||
            !name.trim()
        ) {
            return NextResponse.json(
                { success: false, message: "Code dan name wajib diisi" },
                { status: 400 }
            );
        }

        const data = await prisma.kPI.create({
            data: {
                code: code.trim(),
                name: name.trim(),
                unit: unit?.trim() || null,
                description: description?.trim() || null,
            },
        });

        return NextResponse.json({
            success: true,
            message: "KPI berhasil ditambahkan",
            data,
        }, { status: 201 });

    } catch (error: unknown) {
        console.error("POST KPI ERROR:", error);

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { success: false, message: "Kode KPI sudah digunakan" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Gagal menambahkan KPI" },
            { status: 500 }
        );
    }
}
