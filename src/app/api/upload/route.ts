import {NextRequest, NextResponse} from "next/server";
import {withAuth} from "@/lib/withAuth";
import {uploadFile, getPresignedGetUrl} from "@/lib/storage";
import prisma from "@/lib/prisma";
import {ALLOWED_UPLOAD_FOLDERS} from "@/lib/constants";
import type {JwtPayload} from "@/lib/auth";

export const POST = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (req: NextRequest, {session}: {session: JwtPayload}) => {
        try {
            const formData = await req.formData();
            const file = formData.get("file") as File | null;
            const folder = formData.get("folder") as string | null;

            if (!file) {
                return NextResponse.json({error: "File tidak ditemukan"}, {status: 400});
            }

            if (!folder || !(ALLOWED_UPLOAD_FOLDERS as readonly string[]).includes(folder)) {
                return NextResponse.json({error: "Folder tidak valid"}, {status: 400});
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const fileKey = await uploadFile(buffer, file.name, folder, file.type);

            const presignedUrl = await getPresignedGetUrl(fileKey);

            await prisma.auditLog.create({
                data: {
                    userId: session.sub,
                    action: `UPLOAD_FILE:${folder}:${fileKey}`,
                },
            });

            return NextResponse.json({
                fileKey,
                presignedUrl,
                originalName: file.name,
                size: file.size,
                type: file.type,
            });
        } catch (error) {
            console.error("Upload file error:", error);
            return NextResponse.json({error: "Gagal mengunggah file"}, {status: 500});
        }
    }
);
