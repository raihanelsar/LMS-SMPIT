import {NextResponse} from "next/server";
import {withAuth} from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import {programSchema} from "@/lib/validators";

export const GET = withAuth(["SUPER_ADMIN", "FACILITATOR", "PESERTA"], async (req, {session}) => {
    try {
        const {searchParams} = new URL(req.url);
        const status = searchParams.get("status");
        const userId = session.role === "PESERTA" ? session.sub : searchParams.get("userId");

        const where: Record<string, unknown> = {};

        if (status) {
            where.status = status;
        }

        if (userId) {
            where.users = {
                some: {
                    userId: userId,
                },
            };
        }

        const programs = await prisma.program.findMany({
            where,
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
                        _count: {
                            select: {submissions: true},
                        },
                    },
                },
                _count: {
                    select: {
                        users: true,
                        materials: true,
                        assignments: true,
                    },
                },
            },
            orderBy: {createdAt: "desc"},
        });

        return NextResponse.json({programs});
    } catch (error) {
        console.error("Get programs error:", error);
        return NextResponse.json({error: "Gagal mengambil data program"}, {status: 500});
    }
});

export const POST = withAuth("SUPER_ADMIN", async (req, {session}) => {
    try {
        const body = await req.json();
        const validation = programSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
        }

        const program = await prisma.program.create({
            data: validation.data,
        });

        await prisma.auditLog.create({
            data: {
                userId: session.sub,
                action: `CREATE_PROGRAM:${program.id}`,
            },
        });

        return NextResponse.json({program}, {status: 201});
    } catch (error) {
        console.error("Create program error:", error);
        return NextResponse.json({error: "Gagal membuat program"}, {status: 500});
    }
});
