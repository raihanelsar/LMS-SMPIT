import {NextRequest, NextResponse} from "next/server";
import {withAuth} from "@/lib/withAuth";
import prisma from "@/lib/prisma";

export const GET = withAuth(["SUPER_ADMIN", "FACILITATOR"], async (req: NextRequest) => {
    try {
        const {searchParams} = new URL(req.url);
        const programId = searchParams.get("programId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const where: Record<string, unknown> = {};

        if (programId) {
            where.programId = programId;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                (where.createdAt as Record<string, Date>).gte = new Date(startDate);
            }
            if (endDate) {
                (where.createdAt as Record<string, Date>).lte = new Date(endDate);
            }
        }

        const [
            totalUsers,
            totalPrograms,
            totalSubmissions,
            totalOjtReports,
            submissionsByStatus,
            ojtReportsByStatus,
            programsWithStats,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.program.count(),
            prisma.submission.count(),
            prisma.ojtReport.count(),
            prisma.submission.groupBy({
                by: ["status"],
                _count: true,
            }),
            prisma.ojtReport.groupBy({
                by: ["status"],
                _count: true,
            }),
            prisma.program.findMany({
                include: {
                    _count: {
                        select: {
                            users: true,
                            assignments: true,
                            materials: true,
                        },
                    },
                    assignments: {
                        include: {
                            submissions: true,
                        },
                    },
                },
            }),
        ]);

        const report = {
            summary: {
                totalUsers,
                totalPrograms,
                totalSubmissions,
                totalOjtReports,
            },
            submissions: {
                byStatus: submissionsByStatus,
            },
            ojtReports: {
                byStatus: ojtReportsByStatus,
            },
            programs: programsWithStats.map((program) => ({
                id: program.id,
                title: program.title,
                status: program.status,
                batch: program.batch,
                totalParticipants: program._count.users,
                totalAssignments: program._count.assignments,
                totalMaterials: program._count.materials,
                submissionStats: program.assignments.reduce(
                    (acc, assignment) => {
                        acc.totalSubmissions += assignment.submissions.length;
                        acc.approvedSubmissions += assignment.submissions.filter((s) => s.status === "APPROVED").length;
                        return acc;
                    },
                    {totalSubmissions: 0, approvedSubmissions: 0}
                ),
            })),
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json({report});
    } catch (error) {
        console.error("Generate report error:", error);
        return NextResponse.json({error: "Gagal menghasilkan laporan"}, {status: 500});
    }
});
