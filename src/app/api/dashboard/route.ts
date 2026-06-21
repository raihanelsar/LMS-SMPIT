import {NextRequest, NextResponse} from "next/server";
import {withAuth} from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import type {JwtPayload} from "@/lib/auth";

export const GET = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (req: NextRequest, {session}: {session: JwtPayload}) => {
        try {
            const role = session.role;
            const userId = session.sub;

            if (role === "SUPER_ADMIN") {
                const [
                    totalPrograms,
                    totalUsers,
                    totalSubmissions,
                    totalOjtReports,
                    pendingReviews,
                    activePrograms,
                    completionRate,
                ] = await Promise.all([
                    prisma.program.count(),
                    prisma.user.count({where: {role: "PESERTA"}}),
                    prisma.submission.count(),
                    prisma.ojtReport.count(),
                    prisma.submission.count({where: {status: "SUBMITTED"}}),
                    prisma.program.count({where: {status: "RUNNING"}}),
                    prisma.submission
                    .count({where: {status: "APPROVED"}})
                    .then((approved) =>
                        prisma.submission.count().then((total) => (total > 0 ? (approved / total) * 100 : 0))
                    ),
                ]);

                const recentActivity = await prisma.auditLog.findMany({
                    take: 10,
                    orderBy: {createdAt: "desc"},
                    include: {
                        user: {
                            select: {name: true, email: true},
                        },
                    },
                });

                return NextResponse.json({
                    role: "SUPER_ADMIN",
                    stats: {
                        totalPrograms,
                        totalUsers,
                        totalSubmissions,
                        totalOjtReports,
                        pendingReviews,
                        activePrograms,
                        completionRate: Math.round(completionRate),
                    },
                    recentActivity,
                    announcements: [],
                });
            }

            if (role === "FACILITATOR") {
                const programs = await prisma.program.findMany({
                    where: {
                        users: {
                            some: {userId},
                        },
                    },
                    include: {
                        assignments: {
                            include: {
                                submissions: true,
                            },
                        },
                    },
                });

                const pendingSubmissions = await prisma.submission.count({
                    where: {
                        status: "SUBMITTED",
                        assignment: {
                            program: {
                                users: {
                                    some: {userId},
                                },
                            },
                        },
                    },
                });

                const totalAssignments = programs.reduce((acc, p) => acc + p.assignments.length, 0);
                const totalSubmissions = programs.reduce(
                    (acc, p) => acc + p.assignments.reduce((a, assignment) => a + assignment.submissions.length, 0),
                    0
                );

                return NextResponse.json({
                    role: "FACILITATOR",
                    stats: {
                        totalPrograms: programs.length,
                        pendingSubmissions,
                        totalAssignments,
                        totalSubmissions,
                    },
                    programs: programs.map((p) => ({
                        id: p.id,
                        title: p.title,
                        assignmentCount: p.assignments.length,
                    })),
                });
            }

            if (role === "PESERTA") {
                const programs = await prisma.program.findMany({
                    where: {
                        users: {
                            some: {userId},
                        },
                    },
                    include: {
                        assignments: true,
                    },
                });

                const submissions = await prisma.submission.findMany({
                    where: {userId},
                    include: {
                        assignment: true,
                    },
                });

                const ojtReports = await prisma.ojtReport.findMany({
                    where: {userId},
                });

                const totalAssignments = programs.reduce((acc, p) => acc + p.assignments.length, 0);
                const completedAssignments = submissions.filter((s) => s.status === "APPROVED").length;
                const progressPercentage =
                    totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

                const pendingAssignments = programs
                .flatMap((p) => p.assignments)
                .filter((a) => !submissions.some((s) => s.assignmentId === a.id && s.status !== "DRAFT"));

                const recentFeedback = submissions
                .filter((s) => s.feedback)
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 5);

                return NextResponse.json({
                    role: "PESERTA",
                    stats: {
                        totalPrograms: programs.length,
                        totalAssignments,
                        completedAssignments,
                        pendingAssignments: pendingAssignments.length,
                        totalOjtReports: ojtReports.length,
                        progressPercentage,
                    },
                    pendingAssignments: pendingAssignments.slice(0, 5).map((a) => ({
                        id: a.id,
                        title: a.title,
                        deadline: a.deadline,
                    })),
                    recentFeedback: recentFeedback.map((s) => ({
                        id: s.id,
                        assignmentTitle: s.assignment.title,
                        feedback: s.feedback,
                        status: s.status,
                        updatedAt: s.updatedAt,
                    })),
                });
            }

            return NextResponse.json({error: "Invalid role"}, {status: 400});
        } catch (error) {
            console.error("Dashboard stats error:", error);
            return NextResponse.json({error: "Gagal mengambil statistik dashboard"}, {status: 500});
        }
    }
);
