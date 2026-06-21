import {NextResponse} from "next/server";
import {withAuth} from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import {programSchema} from "@/lib/validators";

export const PUT = withAuth("SUPER_ADMIN", async (req, {params, session}) => {
    try {
        const {id} = await params;
        const body = await req.json();
        const validation = programSchema.partial().safeParse(body);

        if (!validation.success) {
            return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
        }

        const program = await prisma.program.update({
            where: {id: id as string},
            data: validation.data,
        });

        await prisma.auditLog.create({
            data: {
                userId: session.sub,
                action: `UPDATE_PROGRAM:${program.id}`,
            },
        });

        return NextResponse.json({program});
    } catch (error) {
        console.error("Update program error:", error);
        return NextResponse.json({error: "Gagal memperbarui program"}, {status: 500});
    }
});

export const GET = withAuth(["SUPER_ADMIN", "FACILITATOR", "PESERTA"], async (req, {params}) => {
    try {
        const {id} = await params;

        const program = await prisma.program.findUnique({
            where: {id: id as string},
            include: {
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
                materials: true,
                assignments: {
                    include: {
                        submissions: true,
                    },
                },
                reflections: true,
            },
        });

        if (!program) {
            return NextResponse.json({error: "Program tidak ditemukan"}, {status: 404});
        }

        return NextResponse.json({program});
    } catch (error) {
        console.error("Get program error:", error);
        return NextResponse.json({error: "Gagal mengambil data program"}, {status: 500});
    }
});

// DELETE program (SUPER_ADMIN only)
export const DELETE = withAuth("SUPER_ADMIN", async (req, {params, session}) => {
    try {
        const {id} = await params;

        await prisma.program.delete({
            where: {id: id as string},
        });

        await prisma.auditLog.create({
            data: {
                userId: session.sub,
                action: `DELETE_PROGRAM:${id}`,
            },
        });

        return NextResponse.json({message: "Program berhasil dihapus"});
    } catch (error) {
        console.error("Delete program error:", error);
        return NextResponse.json({error: "Gagal menghapus program"}, {status: 500});
    }
});
