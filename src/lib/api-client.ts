/**
 * Centralized API client for frontend HTTP requests
 * Provides type-safe fetch wrappers with consistent error handling
 */

import type {ApiResponse, User, SessionResponse, Program, Assignment, OjtReport, Reflection, Submission} from "@/types";

const BASE_URL = "/api";

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const config: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({error: "Terjadi kesalahan"}));
        throw new ApiError(response.status, errorData.error || "Terjadi kesalahan");
    }

    const data: ApiResponse<T> = await response.json();
    return data as T;
}

// ─── HTTP Methods ────────────────────────────────────────

export const api = {
    get: <T>(endpoint: string, params?: Record<string, string>) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : "";
        return request<T>(`${endpoint}${query}`);
    },

    post: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(endpoint: string) =>
        request<T>(endpoint, {
            method: "DELETE",
        }),

    upload: async <T>(endpoint: string, formData: FormData) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({error: "Upload gagal"}));
            throw new ApiError(response.status, errorData.error || "Upload gagal");
        }

        return (await response.json()) as T;
    },
};

// ─── Auth API ────────────────────────────────────────────

export const authApi = {
    login: (email: string, password: string) => api.post<{user: User; token: string}>("/auth/login", {email, password}),
    logout: () => api.post<{message: string}>("/auth/logout"),
    session: () => api.get<SessionResponse>("/auth/session"),
};

// ─── Programs API ────────────────────────────────────────

export const programsApi = {
    list: (params?: Record<string, string>) => api.get<{programs: Program[]}>("/programs", params),
    get: (id: string) => api.get<{program: Program}>(`/programs/${id}`),
    create: (data: unknown) => api.post<{program: Program}>("/programs", data),
    update: (id: string, data: unknown) => api.put<{program: Program}>(`/programs/${id}`, data),
    delete: (id: string) => api.delete<{message: string}>(`/programs/${id}`),
    assignUser: (programId: string, userId: string) =>
        api.post<{message: string}>(`/programs/${programId}/users`, {userId}),
    removeUser: (programId: string, userId: string) =>
        api.delete<{message: string}>(`/programs/${programId}/users?userId=${userId}`),
};

// ─── Users API ───────────────────────────────────────────

export const usersApi = {
    list: (params?: Record<string, string>) => api.get<{users: User[]}>("/users", params),
    get: (id: string) => api.get<{user: User}>(`/users/${id}`),
    create: (data: unknown) => api.post<{user: User; message: string}>("/users", data),
    update: (id: string, data: unknown) => api.put<{user: User; message: string}>(`/users/${id}`, data),
    delete: (id: string) => api.delete<{message: string}>(`/users/${id}`),
    bulkImport: (formData: FormData) =>
        api.upload<{message: string; results: {success: number; failed: number; errors: string[]}}>(
            "/users/bulk-import",
            formData
        ),
};

// ─── Assignments API ─────────────────────────────────────

export const assignmentsApi = {
    list: (params?: Record<string, string>) => api.get<{assignments: Assignment[]}>("/assignments", params),
    get: (id: string) => api.get<{assignment: Assignment}>(`/assignments/${id}`),
    getById: (id: string) => api.get<{assignment: Assignment}>(`/assignments/${id}`),
    create: (data: unknown) => api.post<{assignment: Assignment; message: string}>("/assignments", data),
    update: (id: string, data: unknown) =>
        api.put<{assignment: Assignment; message: string}>(`/assignments/${id}`, data),
    delete: (id: string) => api.delete<{message: string}>(`/assignments/${id}`),
};

// ─── Submissions API ─────────────────────────────────────

export const submissionsApi = {
    list: (params?: Record<string, string>) => api.get<{submissions: Submission[]}>("/submissions", params),
    create: (data: unknown) => api.post<{submission: Submission}>("/submissions", data),
    review: (id: string, data: unknown) => api.put<{submission: Submission}>(`/submissions/${id}/review`, data),
};

// ─── OJT API ─────────────────────────────────────────────

export const ojtApi = {
    list: (params?: Record<string, string>) => api.get<{ojtReports: OjtReport[]}>("/ojt", params),
    get: (id: string) => api.get<{ojt: OjtReport}>(`/ojt/${id}`),
    create: (data: unknown) => api.post<{ojtReport: OjtReport}>("/ojt", data),
    update: (id: string, data: unknown) => api.put<{ojt: OjtReport; message: string}>(`/ojt/${id}`, data),
    delete: (id: string) => api.delete<{message: string}>(`/ojt/${id}`),
};

// ─── Reflections API ─────────────────────────────────────

export const reflectionsApi = {
    list: (params?: Record<string, string>) => api.get<{reflections: Reflection[]}>("/reflections", params),
    get: (id: string) => api.get<{reflection: Reflection}>(`/reflections/${id}`),
    create: (data: unknown) => api.post<{reflection: Reflection; message: string}>("/reflections", data),
    update: (id: string, data: unknown) =>
        api.put<{reflection: Reflection; message: string}>(`/reflections/${id}`, data),
    delete: (id: string) => api.delete<{message: string}>(`/reflections/${id}`),
};

// ─── Materials API ───────────────────────────────────────

export const materialsApi = {
    list: (params?: Record<string, string>) => api.get<{materials: unknown[]}>("/materials", params),
    get: (id: string) => api.get<{material: unknown}>(`/materials/${id}`),
    create: (data: unknown) => api.post<{material: unknown; message: string}>("/materials", data),
    update: (id: string, data: unknown) => api.put<{material: unknown; message: string}>(`/materials/${id}`, data),
    delete: (id: string) => api.delete<{message: string}>(`/materials/${id}`),
};

// ─── Upload API ──────────────────────────────────────────

export const uploadApi = {
    upload: (formData: FormData) =>
        api.upload<{fileKey: string; presignedUrl: string; originalName: string; size: number; type: string}>(
            "/upload",
            formData
        ),
};

// ─── Reports API ─────────────────────────────────────────

export const reportsApi = {
    school: (params?: Record<string, string>) => api.get<{report: unknown}>("/reports/school", params),
};

// ─── Dashboard API ───────────────────────────────────────

export const dashboardApi = {
    getStats: () => api.get<unknown>("/dashboard"),
};

export {ApiError};
