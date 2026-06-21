import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {withAuth} from "@/lib/withAuth";
import {assignmentUpdateSchema} from "@/lib/validators";

export const GET = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (req: NextRequest, {params}: {params: Promise<Record<string, string | string[]>>}) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            const assignment = await prisma.assignment.findUnique({
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
                    submissions: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                        orderBy: {updatedAt: "desc"},
                    },
                },
            });

            if (!assignment) {
                return NextResponse.json({error: "Penugasan tidak ditemukan"}, {status: 404});
            }

            return NextResponse.json({assignment}, {status: 200});
        } catch (error) {
            console.error("GET assignment error:", error);
            return NextResponse.json({error: "Gagal mengambil data penugasan"}, {status: 500});
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
            const validation = assignmentUpdateSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
            }

            const existing = await prisma.assignment.findUnique({where: {id}});
            if (!existing) {
                return NextResponse.json({error: "Penugasan tidak ditemukan"}, {status: 404});
            }

            const assignment = await prisma.assignment.update({
                where: {id},
                data: validation.data,
            });

            return NextResponse.json({message: "Penugasan berhasil diperbarui", assignment}, {status: 200});
        } catch (error) {
            console.error("PUT assignment error:", error);
            return NextResponse.json({error: "Gagal memperbarui penugasan"}, {status: 500});
        }
    }
);

export const DELETE = withAuth(
    ["SUPER_ADMIN", "FACILITATOR"],
    async (req: NextRequest, {params}: {params: Promise<Record<string, string | string[]>>}) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            const existing = await prisma.assignment.findUnique({where: {id}});
            if (!existing) {
                return NextResponse.json({error: "Penugasan tidak ditemukan"}, {status: 404});
            }

            await prisma.assignment.delete({where: {id}});

            return NextResponse.json({message: "Penugasan berhasil dihapus"}, {status: 200});
        } catch (error) {
            console.error("DELETE assignment error:", error);
            return NextResponse.json({error: "Gagal menghapus penugasan"}, {status: 500});
        }
    }
);
