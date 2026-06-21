/**
 * Application-wide constants
 */

export const APP_NAME = "LMS Seribu Bulan";
export const APP_TAGLINE = "Digitalisasi Pembelajaran";
export const APP_INSTITUTION = "SMPIT Seribu Bulan Boarding School";

export const COOKIE_NAME = "lms_session";
export const TOKEN_EXPIRY_DAYS = 7;

export const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    FACILITATOR: "Fasilitator",
    PESERTA: "Peserta",
} as const;

export const PROGRAM_STATUS_LABELS: Record<string, string> = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    RUNNING: "Running",
    COMPLETED: "Completed",
} as const;

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    REVIEWED: "Reviewed",
    REVISION_REQUIRED: "Revision Required",
    APPROVED: "Approved",
} as const;

export const OJT_STATUS_LABELS: Record<string, string> = {
    PENDING: "Pending",
    SUBMITTED: "Submitted",
    REVIEWED: "Reviewed",
    APPROVED: "Approved",
} as const;

export const ALLOWED_UPLOAD_FOLDERS = ["materials", "submissions", "ojt", "student-products"] as const;

export const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout", "/api/auth/session"] as const;

export const PROTECTED_ROUTES = [
    "/dashboard",
    "/programs",
    "/assignments",
    "/ojt-management",
    "/reflections",
    "/reports",
    "/users",
    "/settings",
] as const;
