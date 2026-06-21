import {NextRequest, NextResponse} from "next/server";
import {withAuth} from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import {submissionSchema} from "@/lib/validators";
import type {JwtPayload} from "@/lib/auth";

export const POST = withAuth("PESERTA", async (req: NextRequest, {session}: {session: JwtPayload}) => {
    try {
        const body = await req.json();
        const validation = submissionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
        }

        const assignment = await prisma.assignment.findUnique({
            where: {id: validation.data.assignmentId},
            include: {
                program: {
                    include: {
                        users: {
                            where: {userId: session.sub},
                        },
                    },
                },
            },
        });

        if (!assignment) {
            return NextResponse.json({error: "Penugasan tidak ditemukan"}, {status: 404});
        }

        if (assignment.program.users.length === 0) {
            return NextResponse.json({error: "Anda tidak terdaftar dalam program ini"}, {status: 403});
        }

        const submission = await prisma.submission.create({
            data: {
                ...validation.data,
                userId: session.sub,
                status: "SUBMITTED",
            },
            include: {
                assignment: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: session.sub,
                action: `SUBMIT_ASSIGNMENT:${submission.id}`,
            },
        });

        return NextResponse.json({submission}, {status: 201});
    } catch (error) {
        console.error("Create submission error:", error);
        return NextResponse.json({error: "Gagal mengunggah tugas"}, {status: 500});
    }
});

export const GET = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (req: NextRequest, {session}: {session: JwtPayload}) => {
        try {
            const {searchParams} = new URL(req.url);
            const assignmentId = searchParams.get("assignmentId");
            const userId = session.role === "PESERTA" ? session.sub : searchParams.get("userId");

            const where: Record<string, unknown> = {};

            if (assignmentId) {
                where.assignmentId = assignmentId;
            }

            if (userId) {
                where.userId = userId;
            }

            const submissions = await prisma.submission.findMany({
                where,
                include: {
                    assignment: {
                        include: {
                            program: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {updatedAt: "desc"},
            });

            return NextResponse.json({submissions});
        } catch (error) {
            console.error("Get submissions error:", error);
            return NextResponse.json({error: "Gagal mengambil data tugas"}, {status: 500});
        }
    }
);
