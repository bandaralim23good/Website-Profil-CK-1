
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET: Mengambil data KPI tahunan
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const yearParam = searchParams.get("year");

        const year = yearParam ? Number(yearParam) : undefined;

        if (
            yearParam &&
            (!Number.isInteger(year) || year! < 1900 || year! > 9999)
        ) {
            return NextResponse.json(
                { success: false, message: "Tahun tidak valid" },
                { status: 400 }
            );
        }

        const data = await prisma.kPIAnnualMetric.findMany({
            where: year !== undefined ? { year } : {},
            include: {
                kpi: true,
            },
            orderBy: [
                { year: "desc" },
                { kpiId: "asc" },
            ],
        });

        return NextResponse.json({
            success: true,
            data,
        });

    } catch (error) {
        console.error("GET KPI ANNUAL ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Gagal mengambil data KPI tahunan" },
            { status: 500 }
        );
    }
}

// POST: Menambahkan atau memperbarui data KPI tahunan
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

        const { kpiId, year, actual, target } = body;

        if (
            !Number.isInteger(kpiId) ||
            kpiId <= 0 ||
            !Number.isInteger(year) ||
            year < 1900 ||
            year > 9999
        ) {
            return NextResponse.json(
                { success: false, message: "KPI ID atau tahun tidak valid" },
                { status: 400 }
            );
        }

        const hasActual = Object.prototype.hasOwnProperty.call(body, "actual");
        const hasTarget = Object.prototype.hasOwnProperty.call(body, "target");

        if (!hasActual && !hasTarget) {
            return NextResponse.json(
                { success: false, message: "Actual atau target harus diisi" },
                { status: 400 }
            );
        }

        const isValidValue = (value: unknown) =>
            value === null ||
            (
                (typeof value === "number" || typeof value === "string") &&
                String(value).trim() !== "" &&
                Number.isFinite(Number(value))
            );

        if (
            (hasActual && !isValidValue(actual)) ||
            (hasTarget && !isValidValue(target))
        ) {
            return NextResponse.json(
                { success: false, message: "Nilai actual atau target tidak valid" },
                { status: 400 }
            );
        }

        const kpi = await prisma.kPI.findUnique({
            where: { id: kpiId },
        });

        if (!kpi) {
            return NextResponse.json(
                { success: false, message: "Master KPI tidak ditemukan" },
                { status: 404 }
            );
        }

        const updateData = {
            ...(hasActual && {
                actual: actual === null ? null : String(actual),
            }),
            ...(hasTarget && {
                target: target === null ? null : String(target),
            }),
        };

        const data = await prisma.kPIAnnualMetric.upsert({
            where: {
                kpiId_year: {
                    kpiId,
                    year,
                },
            },
            update: updateData,
            create: {
                kpiId,
                year,
                actual: hasActual
                    ? actual === null ? null : String(actual)
                    : null,
                target: hasTarget
                    ? target === null ? null : String(target)
                    : null,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Data KPI tahunan berhasil disimpan",
            data,
        });

    } catch (error) {
        console.error("POST KPI ANNUAL ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Gagal menyimpan data KPI tahunan" },
            { status: 500 }
        );
    }
}
