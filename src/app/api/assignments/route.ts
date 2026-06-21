import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {withAuth} from "@/lib/withAuth";
import {assignmentSchema} from "@/lib/validators";

export const GET = withAuth(["SUPER_ADMIN", "FACILITATOR", "PESERTA"], async (req: NextRequest) => {
    try {
        const {searchParams} = new URL(req.url);
        const programId = searchParams.get("programId");
        const type = searchParams.get("type");

        const where: Record<string, unknown> = {};
        if (programId) where.programId = programId;
        if (type) where.type = type;

        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                program: {
                    select: {
                        id: true,
                        title: true,
                        batch: true,
                        status: true,
                    },
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
            orderBy: {deadline: "asc"},
        });

        return NextResponse.json({assignments}, {status: 200});
    } catch (error) {
        console.error("GET assignments error:", error);
        return NextResponse.json({error: "Gagal mengambil data penugasan"}, {status: 500});
    }
});

export const POST = withAuth(["SUPER_ADMIN", "FACILITATOR"], async (req: NextRequest) => {
    try {
        const body = await req.json();
        const validation = assignmentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
        }

        const program = await prisma.program.findUnique({
            where: {id: validation.data.programId},
        });

        if (!program) {
            return NextResponse.json({error: "Program tidak ditemukan"}, {status: 404});
        }

        const assignment = await prisma.assignment.create({
            data: validation.data,
            include: {
                program: {
                    select: {
                        id: true,
                        title: true,
                        batch: true,
                    },
                },
            },
        });

        return NextResponse.json({message: "Penugasan berhasil ditambahkan", assignment}, {status: 201});
    } catch (error) {
        console.error("POST assignment error:", error);
        return NextResponse.json({error: "Gagal menambahkan penugasan"}, {status: 500});
    }
});
