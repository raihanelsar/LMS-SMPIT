/**
 * Centralized type definitions for LMS Seribu Bulan
 */

// ─── Enums ───────────────────────────────────────────────

export type RoleName = "SUPER_ADMIN" | "FACILITATOR" | "PESERTA";

export type ProgramStatus = "DRAFT" | "PUBLISHED" | "RUNNING" | "COMPLETED";

export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "REVIEWED" | "REVISION_REQUIRED" | "APPROVED";

export type OjtStatus = "PENDING" | "SUBMITTED" | "REVIEWED" | "APPROVED";

export type AssignmentType = "RPP" | "MATERI" | "OBSERVASI" | "REFLEKSI";

export type MaterialType = "PDF" | "PPTX" | "LINK" | "VIDEO" | "DOC";

export type ReflectionType = "TEACHER" | "STUDENT";

// ─── User ────────────────────────────────────────────────

export type User = {
    id: string;
    name: string;
    email: string;
    role: RoleName;
    institution?: string;
};

export type UserWithCounts = User & {
    createdAt: string;
    updatedAt: string;
    _count: {
        programs: number;
        submissions: number;
        ojtReports: number;
        reflections: number;
    };
};

export type SessionResponse = {
    authenticated: boolean;
    user: User;
};

// ─── Program ─────────────────────────────────────────────

export type Program = {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    batch: string;
    status: ProgramStatus;
    createdAt: string;
    _count?: {
        users: number;
        materials: number;
        assignments: number;
    };
};

export type ProgramDetail = Program & {
    users: ProgramUser[];
    materials: Material[];
    assignments: Assignment[];
    reflections: Reflection[];
};

export type ProgramUser = {
    id: string;
    userId: string;
    programId: string;
    user: User;
};

// ─── Material ────────────────────────────────────────────

export type Material = {
    id: string;
    title: string;
    fileUrl: string;
    type: MaterialType;
    programId: string;
    program?: Pick<Program, "id" | "title" | "batch">;
};

// ─── Assignment ──────────────────────────────────────────

export type Assignment = {
    id: string;
    title: string;
    description?: string;
    type: AssignmentType;
    deadline: string;
    programId: string;
    program?: Pick<Program, "id" | "title" | "batch" | "status">;
    submissions?: Submission[];
    _count?: {
        submissions: number;
    };
};

// ─── Submission ──────────────────────────────────────────

export type Submission = {
    id: string;
    assignmentId: string;
    userId: string;
    fileUrl: string;
    notes?: string;
    status: SubmissionStatus;
    feedback?: string;
    score?: number;
    createdAt: string;
    updatedAt: string;
    assignment?: Assignment;
    user?: Pick<User, "id" | "name" | "email">;
};

// ─── OJT ─────────────────────────────────────────────────

export type OjtReport = {
    id: string;
    userId: string;
    meeting: number;
    documentationUrl: string;
    videoUrl?: string;
    observationUrl?: string;
    reflectionText?: string;
    status: OjtStatus;
    createdAt: string;
    user?: Pick<User, "id" | "name" | "email">;
    studentProducts: StudentProduct[];
};

export type StudentProduct = {
    id: string;
    ojtReportId: string;
    fileUrl: string;
};

// ─── Reflection ──────────────────────────────────────────

export type Reflection = {
    id: string;
    userId: string;
    programId: string;
    type: ReflectionType;
    response: Record<string, unknown>;
    createdAt: string;
    user?: Pick<User, "id" | "name" | "email" | "role">;
    program?: Pick<Program, "id" | "title" | "batch">;
};

// ─── Audit Log ───────────────────────────────────────────

export type AuditLog = {
    id: string;
    userId: string;
    action: string;
    createdAt: string;
};

// ─── API Responses ───────────────────────────────────────

export type ApiResponse<T = unknown> = {
    data?: T;
    error?: string;
    message?: string;
};

// ─── Navigation ──────────────────────────────────────────

export type NavItem = {
    name: string;
    href: string;
    icon: React.ComponentType<{className?: string}>;
    roles: RoleName[];
};
