import {NextRequest, NextResponse} from "next/server";
import {withAuth} from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import {reviewSchema} from "@/lib/validators";
import type {JwtPayload} from "@/lib/auth";

export const PUT = withAuth(
    "FACILITATOR",
    async (
        req: NextRequest,
        {params, session}: {params: Promise<Record<string, string | string[]>>; session: JwtPayload}
    ) => {
        try {
            const {id} = await params;
            const body = await req.json();
            const validation = reviewSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
            }

            const submission = await prisma.submission.update({
                where: {id: id as string},
                data: {
                    status: validation.data.status,
                    feedback: validation.data.feedback,
                    score: validation.data.score,
                },
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
            });

            await prisma.auditLog.create({
                data: {
                    userId: session.sub,
                    action: `REVIEW_SUBMISSION:${submission.id}`,
                },
            });

            return NextResponse.json({submission});
        } catch (error) {
            console.error("Review submission error:", error);
            return NextResponse.json({error: "Gagal mereview tugas"}, {status: 500});
        }
    }
);
