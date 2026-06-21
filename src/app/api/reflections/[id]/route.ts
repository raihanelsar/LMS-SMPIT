import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {withAuth} from "@/lib/withAuth";
import {reflectionUpdateSchema} from "@/lib/validators";
import type {JwtPayload} from "@/lib/auth";

export const GET = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (
        req: NextRequest,
        {params, session}: {params: Promise<Record<string, string | string[]>>; session: JwtPayload}
    ) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            const reflection = await prisma.reflection.findUnique({
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
                    program: {
                        select: {
                            id: true,
                            title: true,
                            batch: true,
                            status: true,
                        },
                    },
                },
            });

            if (!reflection) {
                return NextResponse.json({error: "Refleksi tidak ditemukan"}, {status: 404});
            }

            if (session.role === "PESERTA" && reflection.userId !== session.sub) {
                return NextResponse.json({error: "Tidak diizinkan untuk melihat refleksi orang lain"}, {status: 403});
            }

            return NextResponse.json({reflection}, {status: 200});
        } catch (error) {
            console.error("GET reflection error:", error);
            return NextResponse.json({error: "Gagal mengambil data refleksi"}, {status: 500});
        }
    }
);

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
            const validation = reflectionUpdateSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
            }

            const existing = await prisma.reflection.findUnique({where: {id}});
            if (!existing) {
                return NextResponse.json({error: "Refleksi tidak ditemukan"}, {status: 404});
            }

            if (session.role === "PESERTA" && existing.userId !== session.sub) {
                return NextResponse.json({error: "Tidak diizinkan untuk mengubah refleksi orang lain"}, {status: 403});
            }

            const updateData: Record<string, unknown> = {};
            if (validation.data.response !== undefined) {
                updateData.response = validation.data.response;
            }
            if (validation.data.type !== undefined) {
                updateData.type = validation.data.type;
            }

            const reflection = await prisma.reflection.update({
                where: {id},
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    program: {
                        select: {
                            id: true,
                            title: true,
                            batch: true,
                        },
                    },
                },
            });

            return NextResponse.json({message: "Refleksi berhasil diperbarui", reflection}, {status: 200});
        } catch (error) {
            console.error("PUT reflection error:", error);
            return NextResponse.json({error: "Gagal memperbarui refleksi"}, {status: 500});
        }
    }
);

export const DELETE = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (
        req: NextRequest,
        {params, session}: {params: Promise<Record<string, string | string[]>>; session: JwtPayload}
    ) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            const existing = await prisma.reflection.findUnique({where: {id}});
            if (!existing) {
                return NextResponse.json({error: "Refleksi tidak ditemukan"}, {status: 404});
            }

            if (session.role === "PESERTA" && existing.userId !== session.sub) {
                return NextResponse.json({error: "Tidak diizinkan untuk menghapus refleksi orang lain"}, {status: 403});
            }

            await prisma.reflection.delete({where: {id}});

            return NextResponse.json({message: "Refleksi berhasil dihapus"}, {status: 200});
        } catch (error) {
            console.error("DELETE reflection error:", error);
            return NextResponse.json({error: "Gagal menghapus refleksi"}, {status: 500});
        }
    }
);
