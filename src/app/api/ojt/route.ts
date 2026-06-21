import {NextRequest, NextResponse} from "next/server";
import {withAuth} from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import {ojtSchema} from "@/lib/validators";
import type {JwtPayload} from "@/lib/auth";

export const POST = withAuth("PESERTA", async (req: NextRequest, {session}: {session: JwtPayload}) => {
    try {
        const body = await req.json();
        const validation = ojtSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
        }

        const existingReport = await prisma.ojtReport.findFirst({
            where: {
                userId: session.sub,
                meeting: validation.data.meeting,
            },
        });

        if (existingReport) {
            return NextResponse.json(
                {error: `Laporan OJT Pertemuan ${validation.data.meeting} sudah ada`},
                {status: 400}
            );
        }

        const ojtReport = await prisma.ojtReport.create({
            data: {
                ...validation.data,
                userId: session.sub,
                status: "SUBMITTED",
            },
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

        await prisma.auditLog.create({
            data: {
                userId: session.sub,
                action: `SUBMIT_OJT_MEETING_${validation.data.meeting}:${ojtReport.id}`,
            },
        });

        return NextResponse.json({ojtReport}, {status: 201});
    } catch (error) {
        console.error("Create OJT report error:", error);
        return NextResponse.json({error: "Gagal mengunggah laporan OJT"}, {status: 500});
    }
});

export const GET = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (req: NextRequest, {session}: {session: JwtPayload}) => {
        try {
            const {searchParams} = new URL(req.url);
            const userId = session.role === "PESERTA" ? session.sub : searchParams.get("userId");
            const meeting = searchParams.get("meeting");

            const where: Record<string, unknown> = {};

            if (userId) {
                where.userId = userId;
            }

            if (meeting) {
                where.meeting = Number(meeting);
            }

            const ojtReports = await prisma.ojtReport.findMany({
                where,
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
                orderBy: {createdAt: "desc"},
            });

            return NextResponse.json({ojtReports});
        } catch (error) {
            console.error("Get OJT reports error:", error);
            return NextResponse.json({error: "Gagal mengambil data OJT"}, {status: 500});
        }
    }
);
