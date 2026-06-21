"use client";

import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {
    BookOpen,
    ClipboardList,
    Users,
    FileCheck,
    TrendingUp,
    Award,
    Clock,
    Activity,
    FileBarChart,
    MessageSquare,
    Briefcase,
    AlertCircle,
    Bell,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {useAuth} from "@/lib/auth-context";
import {dashboardApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";

export default function DashboardPage() {
    const {user} = useAuth();
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        dashboardApi
        .getStats()
        .then((d) => setData(d))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <LoadingPage />;
    }

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat Pagi";
        if (hour < 15) return "Selamat Siang";
        if (hour < 18) return "Selamat Sore";
        return "Selamat Malam";
    };

    // ─── SUPER ADMIN DASHBOARD ───────────────────────────
    if (user?.role === "SUPER_ADMIN") {
        const s = data.stats || {};
        return (
            <div className="space-y-8">
                <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <CardContent className="p-8">
                        <p className="text-sm font-medium text-purple-100 mb-2">
                            {greeting()}, {user?.name}
                        </p>
                        <h1 className="text-3xl font-bold mb-2">Dashboard Administrator</h1>
                        <p className="text-purple-100 mb-6">
                            Monitoring program digitalisasi pembelajaran SMPIT Seribu Bulan
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => router.push("/programs")}
                                className="bg-white text-purple-600 hover:bg-purple-50"
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Kelola Program
                            </Button>
                            <Button
                                onClick={() => router.push("/reports")}
                                variant="outline"
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                            >
                                <FileBarChart className="h-4 w-4 mr-2" />
                                Laporan
                            </Button>
                            <Button
                                onClick={() => router.push("/users")}
                                variant="outline"
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Kelola User
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-600">Total Program</CardTitle>
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{s.totalPrograms || 0}</div>
                            <p className="text-xs text-slate-500 mt-1">{s.activePrograms || 0} program aktif</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-600">Total Guru</CardTitle>
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Users className="h-5 w-5 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{s.totalUsers || 0}</div>
                            <p className="text-xs text-slate-500 mt-1">Peserta terdaftar</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-600">Submission</CardTitle>
                            <div className="bg-green-100 p-2 rounded-lg">
                                <FileCheck className="h-5 w-5 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{s.totalSubmissions || 0}</div>
                            <p className="text-xs text-slate-500 mt-1">{s.pendingReviews || 0} pending review</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-600">Completion Rate</CardTitle>
                            <div className="bg-amber-100 p-2 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-amber-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{s.completionRate || 0}%</div>
                            <p className="text-xs text-slate-500 mt-1">Tingkat penyelesaian</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            Aktivitas Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.recentActivity?.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentActivity.slice(0, 8).map((log: any) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Activity className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900">{log.action}</p>
                                            <p className="text-xs text-slate-500">
                                                {log.user?.name} • {new Date(log.createdAt).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-8">Belum ada aktivitas</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ─── FASILITATOR DASHBOARD ────────────────────────────
    if (user?.role === "FACILITATOR") {
        const s = data.stats || {};
        return (
            <div className="space-y-8">
                <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                    <CardContent className="p-8">
                        <p className="text-sm font-medium text-emerald-100 mb-2">
                            {greeting()}, {user?.name}
                        </p>
                        <h1 className="text-3xl font-bold mb-2">Dashboard Fasilitator</h1>
                        <p className="text-emerald-100 mb-6">Monitoring dan evaluasi penugasan guru peserta program</p>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => router.push("/programs")}
                                className="bg-white text-emerald-600 hover:bg-emerald-50"
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Program
                            </Button>
                            <Button
                                onClick={() => router.push("/assignments")}
                                variant="outline"
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                            >
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Review Tugas
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-600">Program Binaan</CardTitle>
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{s.totalPrograms || 0}</div>
                            <p className="text-xs text-slate-500 mt-1">Program dibina</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-600">Pending Review</CardTitle>
                            <div className="bg-red-100 p-2 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{s.pendingSubmissions || 0}</div>
                            <p className="text-xs text-slate-500 mt-1">Menunggu review</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-600">Total Tugas</CardTitle>
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <ClipboardList className="h-5 w-5 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{s.totalAssignments || 0}</div>
                            <p className="text-xs text-slate-500 mt-1">Tugas dibuat</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-600">Submission</CardTitle>
                            <div className="bg-green-100 p-2 rounded-lg">
                                <FileCheck className="h-5 w-5 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{s.totalSubmissions || 0}</div>
                            <p className="text-xs text-slate-500 mt-1">Tugas terkumpul</p>
                        </CardContent>
                    </Card>
                </div>

                {data.programs?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Program Binaan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.programs.map((p: any) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                                        onClick={() => router.push(`/programs/${p.id}`)}
                                    >
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{p.title}</h4>
                                            <p className="text-sm text-slate-500">{p.assignmentCount} tugas</p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Detail
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // ─── PESERTA (Guru) DASHBOARD ─────────────────────────
    const s = data.stats || {};
    return (
        <div className="space-y-8">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardContent className="p-8">
                    <p className="text-sm font-medium text-blue-100 mb-2">
                        {greeting()}, {user?.name}!
                    </p>
                    <h1 className="text-3xl font-bold mb-2">Dashboard Peserta</h1>
                    <p className="text-blue-100 mb-6">Pantau progress pembelajaran dan tugas Anda</p>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => router.push("/programs")}
                            className="bg-white text-blue-600 hover:bg-blue-50 shadow-md"
                        >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Lihat Program
                        </Button>
                        <Button
                            onClick={() => router.push("/assignments")}
                            variant="outline"
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                        >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Tugas Saya
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Progress Bar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Progress Pembelajaran
                    </CardTitle>
                    <CardDescription>Tingkat penyelesaian tugas Anda</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                                {s.completedAssignments || 0} / {s.totalAssignments || 0} tugas selesai
                            </span>
                            <span className="text-sm font-bold text-blue-600">{s.progressPercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
                                style={{width: `${s.progressPercentage || 0}%`}}
                            ></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-600">Program Aktif</CardTitle>
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{s.totalPrograms || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">Program diikuti</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-600">Tugas Pending</CardTitle>
                        <div className="bg-amber-100 p-2 rounded-lg">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{s.pendingAssignments || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">Belum diselesaikan</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-600">Tugas Selesai</CardTitle>
                        <div className="bg-green-100 p-2 rounded-lg">
                            <FileCheck className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{s.completedAssignments || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">Approved</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-600">Laporan OJT</CardTitle>
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <Briefcase className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{s.totalOjtReports || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">Laporan dikirim</p>
                    </CardContent>
                </Card>
            </div>

            {data.pendingAssignments?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-600" />
                            Tugas Belum Diselesaikan
                        </CardTitle>
                        <CardDescription>Deadline terdekat</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.pendingAssignments.map((a: any) => (
                                <div
                                    key={a.id}
                                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                                >
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{a.title}</h4>
                                        <p className="text-sm text-slate-500">
                                            Deadline:{" "}
                                            {new Date(a.deadline).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => router.push("/assignments")}>
                                        Kerjakan
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {data.recentFeedback?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-indigo-600" />
                            Feedback Terbaru
                        </CardTitle>
                        <CardDescription>Umpan balik dari fasilitator</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.recentFeedback.map((f: any) => (
                                <div key={f.id} className="p-4 border border-slate-200 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-slate-900">{f.assignmentTitle}</h4>
                                        <Badge variant={f.status === "APPROVED" ? "success" : "warning"}>
                                            {f.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2">{f.feedback}</p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(f.updatedAt).toLocaleString("id-ID")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
