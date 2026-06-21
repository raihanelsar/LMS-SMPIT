import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {withAuth} from "@/lib/withAuth";
import {ojtUpdateSchema} from "@/lib/validators";
import type {JwtPayload} from "@/lib/auth";

// GET single OJT report
export const GET = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (
        req: NextRequest,
        {params, session}: {params: Promise<Record<string, string | string[]>>; session: JwtPayload}
    ) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            const ojt = await prisma.ojtReport.findUnique({
                where: {id},
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    studentProducts: true,
                },
            });

            if (!ojt) {
                return NextResponse.json({error: "Laporan OJT tidak ditemukan"}, {status: 404});
            }

            // Peserta can only view their own OJT reports
            if (session.role === "PESERTA" && ojt.userId !== session.sub) {
                return NextResponse.json(
                    {error: "Tidak diizinkan untuk melihat laporan OJT orang lain"},
                    {status: 403}
                );
            }

            return NextResponse.json({ojt}, {status: 200});
        } catch (error) {
            console.error("GET OJT error:", error);
            return NextResponse.json({error: "Gagal mengambil data OJT"}, {status: 500});
        }
    }
);

// PUT update OJT report
export const PUT = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (
        req: NextRequest,
        {params, session}: {params: Promise<Record<string, string | string[]>>; session: JwtPayload}
    ) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;
            const body = await req.json();
            const validation = ojtUpdateSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
            }

            const existing = await prisma.ojtReport.findUnique({where: {id}});
            if (!existing) {
                return NextResponse.json({error: "Laporan OJT tidak ditemukan"}, {status: 404});
            }

            // Peserta can only update their own OJT reports
            if (session.role === "PESERTA" && existing.userId !== session.sub) {
                return NextResponse.json(
                    {error: "Tidak diizinkan untuk mengubah laporan OJT orang lain"},
                    {status: 403}
                );
            }

            // Only facilitator or super admin can update status
            if (validation.data.status !== undefined && session.role === "PESERTA") {
                return NextResponse.json(
                    {error: "Hanya fasilitator atau admin yang dapat mengubah status"},
                    {status: 403}
                );
            }

            const ojt = await prisma.ojtReport.update({
                where: {id},
                data: validation.data,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    studentProducts: true,
                },
            });

            return NextResponse.json({message: "Laporan OJT berhasil diperbarui", ojt}, {status: 200});
        } catch (error) {
            console.error("PUT OJT error:", error);
            return NextResponse.json({error: "Gagal memperbarui laporan OJT"}, {status: 500});
        }
    }
);

// DELETE OJT report
export const DELETE = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (
        req: NextRequest,
        {params, session}: {params: Promise<Record<string, string | string[]>>; session: JwtPayload}
    ) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            const existing = await prisma.ojtReport.findUnique({where: {id}});
            if (!existing) {
                return NextResponse.json({error: "Laporan OJT tidak ditemukan"}, {status: 404});
            }

            // Peserta can only delete their own OJT reports
            if (session.role === "PESERTA" && existing.userId !== session.sub) {
                return NextResponse.json(
                    {error: "Tidak diizinkan untuk menghapus laporan OJT orang lain"},
                    {status: 403}
                );
            }

            await prisma.ojtReport.delete({where: {id}});

            return NextResponse.json({message: "Laporan OJT berhasil dihapus"}, {status: 200});
        } catch (error) {
            console.error("DELETE OJT error:", error);
            return NextResponse.json({error: "Gagal menghapus laporan OJT"}, {status: 500});
        }
    }
);
