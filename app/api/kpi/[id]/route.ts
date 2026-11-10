
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// PATCH: Mengedit KPI
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const kpiId = Number(id);

        if (!Number.isInteger(kpiId) || kpiId <= 0) {
            return NextResponse.json(
                { success: false, message: "ID KPI tidak valid" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { code, name, unit, description, isActive } = body;

        const existing = await prisma.kPI.findUnique({
            where: { id: kpiId },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, message: "KPI tidak ditemukan" },
                { status: 404 }
            );
        }

        const data = await prisma.kPI.update({
            where: { id: kpiId },
            data: {
                ...(code !== undefined && { code: code.trim() }),
                ...(name !== undefined && { name: name.trim() }),
                ...(unit !== undefined && {
                    unit: unit?.trim() || null,
                }),
                ...(description !== undefined && {
                    description: description?.trim() || null,
                }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({
            success: true,
            message: "KPI berhasil diperbarui",
            data,
        });

    } catch (error) {
        console.error("PATCH KPI ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Gagal memperbarui KPI" },
            { status: 500 }
        );
    }
}

// DELETE: Menonaktifkan KPI
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const kpiId = Number(id);

        if (!Number.isInteger(kpiId) || kpiId <= 0) {
            return NextResponse.json(
                { success: false, message: "ID KPI tidak valid" },
                { status: 400 }
            );
        }

        const existing = await prisma.kPI.findUnique({
            where: { id: kpiId },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, message: "KPI tidak ditemukan" },
                { status: 404 }
            );
        }

        const data = await prisma.kPI.update({
            where: { id: kpiId },
            data: { isActive: false },
        });

        return NextResponse.json({
            success: true,
            message: "KPI berhasil dinonaktifkan",
            data,
        });

    } catch (error) {
        console.error("DELETE KPI ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Gagal menonaktifkan KPI" },
            { status: 500 }
        );
    }
}
