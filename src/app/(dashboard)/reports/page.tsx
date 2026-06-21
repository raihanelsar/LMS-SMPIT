"use client";

import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {FileBarChart, Users, BookOpen, FileCheck, Briefcase, Download, User, Calendar, Filter} from "lucide-react";
import {reportsApi, usersApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";

type Report = {
    summary: {
        totalUsers: number;
        totalPrograms: number;
        totalSubmissions: number;
        totalOjtReports: number;
    };
    programs: Array<{
        id: string;
        title: string;
        status: string;
        totalParticipants: number;
        totalAssignments: number;
        submissionStats: {approvedSubmissions: number; totalSubmissions: number};
    }>;
};

type UserReport = {
    id: string;
    name: string;
    email: string;
    role: string;
    institution: string;
    createdAt: string;
    _count?: {
        submissions: number;
        ojtReports: number;
    };
};

export default function ReportsPage() {
    const [report, setReport] = useState<Report | null>(null);
    const [userReports, setUserReports] = useState<UserReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [reportRes, usersRes] = await Promise.all([reportsApi.school(), usersApi.list()]);
            setReport(reportRes.report as Report);
            setUserReports((usersRes.users || []) as UserReport[]);
        } catch (error) {
            console.error("Error loading reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!report) return;

        // Create CSV content
        let csv = "Laporan Sekolah - LMS Digitalisasi Pembelajaran SMPIT Seribu Bulan\n\n";
        csv += "Ringkasan\n";
        csv += `Total Pengguna,${report.summary.totalUsers}\n`;
        csv += `Total Program,${report.summary.totalPrograms}\n`;
        csv += `Total Submission,${report.summary.totalSubmissions}\n`;
        csv += `Total OJT Reports,${report.summary.totalOjtReports}\n\n`;

        csv += "Statistik Program\n";
        csv += "Nama Program,Status,Peserta,Total Tugas,Submission Disetujui,Total Submission\n";
        report.programs.forEach((program) => {
            csv += `"${program.title}",${program.status},${program.totalParticipants},${program.totalAssignments},${program.submissionStats.approvedSubmissions},${program.submissionStats.totalSubmissions}\n`;
        });

        // Download CSV
        const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `laporan-sekolah-${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportIndividualReport = (user: UserReport) => {
        let csv = `Laporan Individu - ${user.name}\n\n`;
        csv += `Nama,${user.name}\n`;
        csv += `Email,${user.email}\n`;
        csv += `Role,${user.role}\n`;
        csv += `Institusi,${user.institution}\n`;
        csv += `Tanggal Bergabung,${new Date(user.createdAt).toLocaleDateString("id-ID")}\n\n`;
        csv += `Total Submission,${user._count?.submissions || 0}\n`;
        csv += `Total OJT Reports,${user._count?.ojtReports || 0}\n`;

        const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `laporan-${user.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredUsers = userReports.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === "all" || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Laporan & Analitik</h1>
                    <p className="text-slate-600 mt-1">Metrik kinerja seluruh sekolah</p>
                </div>
                <Button onClick={exportToCSV} disabled={!report}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Laporan
                </Button>
            </div>

            <Tabs defaultValue="school" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="school">Laporan Sekolah</TabsTrigger>
                    <TabsTrigger value="individual">Laporan Individu</TabsTrigger>
                </TabsList>

                <TabsContent value="school">
                    {!report ? (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <FileBarChart className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600 font-medium">Belum ada laporan tersedia</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                        <CardTitle className="text-sm font-semibold text-slate-600">
                                            Total Pengguna
                                        </CardTitle>
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {report.summary.totalUsers}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Pengguna terdaftar</p>
                                    </CardContent>
                                </Card>

                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                        <CardTitle className="text-sm font-semibold text-slate-600">
                                            Total Program
                                        </CardTitle>
                                        <div className="bg-indigo-100 p-2 rounded-lg">
                                            <BookOpen className="h-5 w-5 text-indigo-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {report.summary.totalPrograms}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Program aktif</p>
                                    </CardContent>
                                </Card>

                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                        <CardTitle className="text-sm font-semibold text-slate-600">
                                            Total Submission
                                        </CardTitle>
                                        <div className="bg-green-100 p-2 rounded-lg">
                                            <FileCheck className="h-5 w-5 text-green-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {report.summary.totalSubmissions}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Submission terkumpul</p>
                                    </CardContent>
                                </Card>

                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                        <CardTitle className="text-sm font-semibold text-slate-600">
                                            Laporan OJT
                                        </CardTitle>
                                        <div className="bg-amber-100 p-2 rounded-lg">
                                            <Briefcase className="h-5 w-5 text-amber-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {report.summary.totalOjtReports}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Laporan OJT</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-slate-900">Statistik Program</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {report.programs.map(
                                            (program: {
                                                id: string;
                                                title: string;
                                                status: string;
                                                totalParticipants: number;
                                                totalAssignments: number;
                                                submissionStats: {
                                                    approvedSubmissions: number;
                                                    totalSubmissions: number;
                                                };
                                            }) => (
                                                <div
                                                    key={program.id}
                                                    className="border-b border-slate-200 pb-4 last:border-0"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-slate-900">
                                                            {program.title}
                                                        </h3>
                                                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                            {program.status}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-slate-500">Peserta</p>
                                                            <p className="font-semibold text-slate-900">
                                                                {program.totalParticipants}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-500">Tugas</p>
                                                            <p className="font-semibold text-slate-900">
                                                                {program.totalAssignments}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-500">Disetujui</p>
                                                            <p className="font-semibold text-slate-900">
                                                                {program.submissionStats.approvedSubmissions} /{" "}
                                                                {program.submissionStats.totalSubmissions}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="individual">
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Cari nama atau email..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <select
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-md"
                                    >
                                        <option value="all">Semua Role</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                        <option value="FACILITATOR">Fasilitator</option>
                                        <option value="PESERTA">Peserta</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        {filteredUsers.length === 0 ? (
                            <Card>
                                <CardContent className="py-16 text-center">
                                    <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 text-lg">Tidak ada pengguna ditemukan</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {filteredUsers.map((user) => (
                                    <Card key={user.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <User className="h-5 w-5 text-slate-600" />
                                                        <CardTitle className="text-lg text-slate-900">
                                                            {user.name}
                                                        </CardTitle>
                                                        <Badge variant="outline">{user.role}</Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                    <p className="text-sm text-slate-500 mt-1">{user.institution}</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => exportIndividualReport(user)}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Export
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-500">Tanggal Bergabung</p>
                                                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Total Submission</p>
                                                    <p className="font-semibold text-slate-900">
                                                        {user._count?.submissions || 0}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Total OJT Reports</p>
                                                    <p className="font-semibold text-slate-900">
                                                        {user._count?.ojtReports || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
