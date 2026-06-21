import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {withAuth} from "@/lib/withAuth";
import {materialSchema} from "@/lib/validators";

export const GET = withAuth(["SUPER_ADMIN", "FACILITATOR", "PESERTA"], async (req: NextRequest) => {
    try {
        const {searchParams} = new URL(req.url);
        const programId = searchParams.get("programId");

        const where = programId ? {programId} : {};

        const materials = await prisma.material.findMany({
            where,
            include: {
                program: {
                    select: {
                        id: true,
                        title: true,
                        batch: true,
                    },
                },
            },
            orderBy: {
                id: "desc",
            },
        });

        return NextResponse.json({materials}, {status: 200});
    } catch (error) {
        console.error("GET materials error:", error);
        return NextResponse.json({error: "Gagal mengambil data materi"}, {status: 500});
    }
});

export const POST = withAuth(["SUPER_ADMIN", "FACILITATOR"], async (req: NextRequest) => {
    try {
        const body = await req.json();
        const validation = materialSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
        }

        const material = await prisma.material.create({
            data: validation.data,
        });

        return NextResponse.json({message: "Materi berhasil ditambahkan", material}, {status: 201});
    } catch (error) {
        console.error("POST material error:", error);
        return NextResponse.json({error: "Gagal menambahkan materi"}, {status: 500});
    }
});
