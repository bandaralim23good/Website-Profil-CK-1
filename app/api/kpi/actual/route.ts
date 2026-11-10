import { NextResponse } from "next/server";

export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            message: "API KPI Actual berhasil",
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan" },
            { status: 500 }
        );
    }
}