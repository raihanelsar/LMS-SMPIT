"use client";

import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {MessageSquare, Plus, Calendar, User, BarChart3} from "lucide-react";
import {reflectionsApi, programsApi} from "@/lib/api-client";
import {useAuth} from "@/lib/auth-context";
import {LoadingPage} from "@/components/ui/loading";
import type {Reflection, Program} from "@/types";

export default function ReflectionsPage() {
    const [reflections, setReflections] = useState<Reflection[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        programId: "",
        type: "TEACHER" as "TEACHER" | "STUDENT",
        response: {
            kekuatan: "",
            kelemahan: "",
            rencanaPerbaikan: "",
            catatanTambahan: "",
        },
    });
    const [submitting, setSubmitting] = useState(false);
    const {user} = useAuth();

    const isPeserta = user?.role === "PESERTA";
    const isFasilitator = user?.role === "FACILITATOR" || user?.role === "SUPER_ADMIN";

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [reflectionsRes, programsRes] = await Promise.all([reflectionsApi.list(), programsApi.list()]);
            setReflections((reflectionsRes.reflections || []) as Reflection[]);
            setPrograms((programsRes.programs || []) as Program[]);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.programId) {
            alert("Pilih program terlebih dahulu");
            return;
        }
        setSubmitting(true);
        try {
            await reflectionsApi.create({
                programId: formData.programId,
                type: formData.type,
                response: formData.response,
            });
            await loadData();
            setFormData({
                programId: "",
                type: "TEACHER",
                response: {
                    kekuatan: "",
                    kelemahan: "",
                    rencanaPerbaikan: "",
                    catatanTambahan: "",
                },
            });
            setShowForm(false);
            alert("Refleksi berhasil disimpan!");
        } catch (error: any) {
            console.error("Submit error:", error);
            alert(error.message || "Gagal menyimpan refleksi");
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "TEACHER":
                return "default";
            case "STUDENT":
                return "success";
            default:
                return "secondary";
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "TEACHER":
                return "Refleksi Guru";
            case "STUDENT":
                return "Refleksi Siswa";
            default:
                return type;
        }
    };

    // Statistics
    const totalReflections = reflections.length;
    const teacherReflections = reflections.filter((r) => r.type === "TEACHER").length;
    const studentReflections = reflections.filter((r) => r.type === "STUDENT").length;

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Refleksi</h1>
                    <p className="text-slate-500 mt-1">Form refleksi guru dan siswa</p>
                </div>
                {isPeserta && (
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Refleksi
                    </Button>
                )}
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Refleksi</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReflections}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Refleksi Guru</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teacherReflections}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Refleksi Siswa</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{studentReflections}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Form */}
            {isPeserta && showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Form Refleksi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Program *</label>
                                <select
                                    value={formData.programId}
                                    onChange={(e) => setFormData({...formData, programId: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                                    required
                                >
                                    <option value="">Pilih Program</option>
                                    {programs.map((program) => (
                                        <option key={program.id} value={program.id}>
                                            {program.title} - Batch {program.batch}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Jenis Refleksi *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({...formData, type: e.target.value as "TEACHER" | "STUDENT"})
                                    }
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                                >
                                    <option value="TEACHER">Refleksi Guru</option>
                                    <option value="STUDENT">Refleksi Siswa</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Kekuatan Pembelajaran *</label>
                                <Textarea
                                    value={formData.response.kekuatan}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            response: {...formData.response, kekuatan: e.target.value},
                                        })
                                    }
                                    rows={3}
                                    placeholder="Apa yang sudah berjalan baik dalam pembelajaran?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Kelemahan/Tantangan *</label>
                                <Textarea
                                    value={formData.response.kelemahan}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            response: {...formData.response, kelemahan: e.target.value},
                                        })
                                    }
                                    rows={3}
                                    placeholder="Apa kendala atau tantangan yang dihadapi?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Rencana Perbaikan *</label>
                                <Textarea
                                    value={formData.response.rencanaPerbaikan}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            response: {...formData.response, rencanaPerbaikan: e.target.value},
                                        })
                                    }
                                    rows={3}
                                    placeholder="Apa rencana Anda untuk memperbaiki pembelajaran ke depan?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Catatan Tambahan (Opsional)
                                </label>
                                <Textarea
                                    value={formData.response.catatanTambahan}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            response: {...formData.response, catatanTambahan: e.target.value},
                                        })
                                    }
                                    rows={3}
                                    placeholder="Catatan lain yang ingin disampaikan..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Menyimpan..." : "Simpan Refleksi"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Reflections List */}
            {reflections.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <MessageSquare className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Belum ada refleksi</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {reflections.map((reflection) => (
                        <Card key={reflection.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={getTypeColor(reflection.type) as any}>
                                                {getTypeLabel(reflection.type)}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg text-slate-900">
                                            {reflection.program?.title}
                                        </CardTitle>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Oleh: {reflection.user?.name || "Unknown"}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {new Date(reflection.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>

                                    {reflection.response && typeof reflection.response === "object" && (
                                        <div className="space-y-3 pt-3 border-t border-slate-200">
                                            {(reflection.response as any).kekuatan && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 mb-1">Kekuatan:</p>
                                                    <p className="text-sm text-slate-600">
                                                        {(reflection.response as any).kekuatan}
                                                    </p>
                                                </div>
                                            )}
                                            {(reflection.response as any).kelemahan && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 mb-1">
                                                        Kelemahan/Tantangan:
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        {(reflection.response as any).kelemahan}
                                                    </p>
                                                </div>
                                            )}
                                            {(reflection.response as any).rencanaPerbaikan && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 mb-1">
                                                        Rencana Perbaikan:
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        {(reflection.response as any).rencanaPerbaikan}
                                                    </p>
                                                </div>
                                            )}
                                            {(reflection.response as any).catatanTambahan && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 mb-1">
                                                        Catatan Tambahan:
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        {(reflection.response as any).catatanTambahan}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
