import {z} from "zod";

export const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});
export const userSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    role: z.enum(["SUPER_ADMIN", "FACILITATOR", "PESERTA"]),
    institution: z.string().default("SMPIT Seribu Bulan Boarding School"),
});

export const userUpdateSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter").optional(),
    email: z.string().email("Email tidak valid").optional(),
    password: z.string().min(6, "Password minimal 6 karakter").optional(),
    role: z.enum(["SUPER_ADMIN", "FACILITATOR", "PESERTA"]).optional(),
    institution: z.string().optional(),
});
export const programSchema = z.object({
    title: z.string().min(3, "Judul minimal 3 karakter"),
    description: z.string().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    batch: z.string().min(1, "Batch wajib diisi"),
    status: z.enum(["DRAFT", "PUBLISHED", "RUNNING", "COMPLETED"]).default("DRAFT"),
});

export const submissionSchema = z.object({
    assignmentId: z.string().uuid(),
    fileUrl: z.string().min(1),
});

export const reviewSchema = z.object({
    status: z.enum(["REVIEWED", "REVISION_REQUIRED", "APPROVED"]),
    feedback: z.string().optional(),
    score: z.number().int().min(0).max(100).optional(),
});

export const ojtSchema = z.object({
    meeting: z.number().int().min(1).max(2),
    documentationUrl: z.string().min(1),
    videoUrl: z.string().optional(),
    observationUrl: z.string().optional(),
    reflectionText: z.string().optional(),
});

export const ojtUpdateSchema = z.object({
    meeting: z.number().int().min(1).max(2).optional(),
    documentationUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional().nullable(),
    observationUrl: z.string().url().optional().nullable(),
    reflectionText: z.string().optional().nullable(),
    status: z.enum(["PENDING", "SUBMITTED", "REVIEWED", "APPROVED"]).optional(),
});

export const reflectionSchema = z.object({
    programId: z.string().uuid(),
    type: z.enum(["TEACHER", "STUDENT"]),
    response: z.record(z.string(), z.unknown()),
});

export const reflectionUpdateSchema = z.object({
    response: z.record(z.string(), z.unknown()).optional(),
    type: z.enum(["TEACHER", "STUDENT"]).optional(),
});

export const materialSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi"),
    fileUrl: z.string().min(1, "File URL wajib diisi"),
    type: z.enum(["PDF", "PPTX", "LINK", "VIDEO", "DOC"]),
    programId: z.string().uuid(),
});

export const materialUpdateSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi").optional(),
    fileUrl: z.string().min(1, "File URL wajib diisi").optional(),
    type: z.enum(["PDF", "PPTX", "LINK", "VIDEO", "DOC"]).optional(),
});

export const assignmentSchema = z.object({
    title: z.string().min(2, "Judul minimal 2 karakter"),
    description: z.string().optional(),
    type: z.enum(["RPP", "MATERI", "OBSERVASI", "REFLEKSI"]),
    deadline: z.string().datetime(),
    programId: z.string().uuid(),
});

export const assignmentUpdateSchema = z.object({
    title: z.string().min(2, "Judul minimal 2 karakter").optional(),
    description: z.string().optional(),
    type: z.enum(["RPP", "MATERI", "OBSERVASI", "REFLEKSI"]).optional(),
    deadline: z.string().datetime().optional(),
});
