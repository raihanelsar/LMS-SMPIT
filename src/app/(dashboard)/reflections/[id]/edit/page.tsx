"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ArrowLeft} from "lucide-react";
import {reflectionsApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";
import type {Reflection} from "@/types";

export default function ReflectionEditPage() {
    const [reflection, setReflection] = useState<Reflection | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const params = useParams();

    const [formData, setFormData] = useState({
        type: "TEACHER" as "TEACHER" | "STUDENT",
        response: {
            kekuatan: "",
            kelemahan: "",
            rencanaPerbaikan: "",
            catatanTambahan: "",
        },
    });

    useEffect(() => {
        const loadReflection = async () => {
            try {
                const response = await reflectionsApi.get(params.id as string);
                const data = response.reflection as Reflection;
                setReflection(data);
                const response = (data.response ?? {}) as Record<string, string>;
                setFormData({
                    type: data.type,
                    response: {
                        kekuatan: response.kekuatan || "",
                        kelemahan: response.kelemahan || "",
                        rencanaPerbaikan: response.rencanaPerbaikan || "",
                        catatanTambahan: response.catatanTambahan || "",
                    },
                });
            } catch (error) {
                console.error("Failed to load reflection:", error);
            } finally {
                setLoading(false);
            }
        };

        loadReflection();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await reflectionsApi.update(params.id as string, {
                type: formData.type,
                response: formData.response,
            });
            router.push("/reflections");
        } catch (error) {
            console.error("Update reflection error:", error);
            alert(error instanceof Error ? error.message : "Gagal memperbarui refleksi");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (!reflection) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <p className="text-slate-500 text-lg">Refleksi tidak ditemukan</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/reflections")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Edit Refleksi</h1>
                    <p className="text-slate-500 mt-1">Perbarui jawaban refleksi Anda</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Form Refleksi</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="type">Jenis Refleksi</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({...formData, type: value as "TEACHER" | "STUDENT"})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TEACHER">Refleksi Guru</SelectItem>
                                    <SelectItem value="STUDENT">Refleksi Siswa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kekuatan">Kekuatan Pembelajaran</Label>
                            <Textarea
                                id="kekuatan"
                                value={formData.response.kekuatan}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        response: {...formData.response, kekuatan: e.target.value},
                                    })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kelemahan">Kelemahan/Tantangan</Label>
                            <Textarea
                                id="kelemahan"
                                value={formData.response.kelemahan}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        response: {...formData.response, kelemahan: e.target.value},
                                    })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rencanaPerbaikan">Rencana Perbaikan</Label>
                            <Textarea
                                id="rencanaPerbaikan"
                                value={formData.response.rencanaPerbaikan}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        response: {...formData.response, rencanaPerbaikan: e.target.value},
                                    })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="catatanTambahan">Catatan Tambahan</Label>
                            <Textarea
                                id="catatanTambahan"
                                value={formData.response.catatanTambahan}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        response: {...formData.response, catatanTambahan: e.target.value},
                                    })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.push("/reflections")}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}