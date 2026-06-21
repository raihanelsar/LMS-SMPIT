import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {withAuth} from "@/lib/withAuth";
import {reflectionSchema} from "@/lib/validators";
import type {JwtPayload} from "@/lib/auth";
import type {Prisma} from "@prisma/client";

export const GET = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (req: NextRequest, {session}: {session: JwtPayload}) => {
        try {
            const {searchParams} = new URL(req.url);
            const programId = searchParams.get("programId");
            const userId = searchParams.get("userId");
            const type = searchParams.get("type");

            const where: Record<string, unknown> = {};
            if (programId) where.programId = programId;
            if (userId) where.userId = userId;
            if (type) where.type = type;

            if (session.role === "PESERTA") {
                where.userId = session.sub;
            }

            const reflections = await prisma.reflection.findMany({
                where,
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
                        },
                    },
                },
                orderBy: {createdAt: "desc"},
            });

            return NextResponse.json({reflections}, {status: 200});
        } catch (error) {
            console.error("GET reflections error:", error);
            return NextResponse.json({error: "Gagal mengambil data refleksi"}, {status: 500});
        }
    }
);

export const POST = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (req: NextRequest, {session}: {session: JwtPayload}) => {
        try {
            const body = await req.json();
            const validation = reflectionSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
            }

            const program = await prisma.program.findUnique({
                where: {id: validation.data.programId},
                include: {
                    users: {
                        where: {userId: session.sub},
                    },
                },
            });

            if (!program) {
                return NextResponse.json({error: "Program tidak ditemukan"}, {status: 404});
            }

            if (program.users.length === 0) {
                return NextResponse.json({error: "Anda tidak terdaftar dalam program ini"}, {status: 403});
            }

            const reflection = await prisma.reflection.create({
                data: {
                    userId: session.sub,
                    programId: validation.data.programId,
                    type: validation.data.type,
                    response: validation.data.response as Prisma.InputJsonValue,
                },
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

            return NextResponse.json({message: "Refleksi berhasil ditambahkan", reflection}, {status: 201});
        } catch (error) {
            console.error("POST reflection error:", error);
            return NextResponse.json({error: "Gagal menambahkan refleksi"}, {status: 500});
        }
    }
);
