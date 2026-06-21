import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {withAuth} from "@/lib/withAuth";
import {materialUpdateSchema} from "@/lib/validators";

export const GET = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (req: NextRequest, {params}: {params: Promise<Record<string, string | string[]>>}) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            const material = await prisma.material.findUnique({
                where: {id},
                include: {
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

            if (!material) {
                return NextResponse.json({error: "Materi tidak ditemukan"}, {status: 404});
            }

            return NextResponse.json({material}, {status: 200});
        } catch (error) {
            console.error("GET material error:", error);
            return NextResponse.json({error: "Gagal mengambil data materi"}, {status: 500});
        }
    }
);

export const PUT = withAuth(
    ["SUPER_ADMIN", "FACILITATOR"],
    async (req: NextRequest, {params}: {params: Promise<Record<string, string | string[]>>}) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;
            const body = await req.json();
            const validation = materialUpdateSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
            }

            const existing = await prisma.material.findUnique({where: {id}});
            if (!existing) {
                return NextResponse.json({error: "Materi tidak ditemukan"}, {status: 404});
            }

            const material = await prisma.material.update({
                where: {id},
                data: validation.data,
            });

            return NextResponse.json({message: "Materi berhasil diperbarui", material}, {status: 200});
        } catch (error) {
            console.error("PUT material error:", error);
            return NextResponse.json({error: "Gagal memperbarui materi"}, {status: 500});
        }
    }
);

export const DELETE = withAuth(
    ["SUPER_ADMIN", "FACILITATOR"],
    async (req: NextRequest, {params}: {params: Promise<Record<string, string | string[]>>}) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            const existing = await prisma.material.findUnique({where: {id}});
            if (!existing) {
                return NextResponse.json({error: "Materi tidak ditemukan"}, {status: 404});
            }

            await prisma.material.delete({where: {id}});

            return NextResponse.json({message: "Materi berhasil dihapus"}, {status: 200});
        } catch (error) {
            console.error("DELETE material error:", error);
            return NextResponse.json({error: "Gagal menghapus materi"}, {status: 500});
        }
    }
);
