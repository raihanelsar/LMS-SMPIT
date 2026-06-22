"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowLeft} from "lucide-react";
import {ojtApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";
import type {OjtReport} from "@/types";

export default function OjtEditPage() {
    const [report, setReport] = useState<OjtReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const params = useParams();

    const [formData, setFormData] = useState({
        meeting: 1,
        documentationUrl: "",
        videoUrl: "",
        observationUrl: "",
        reflectionText: "",
    });

    useEffect(() => {
        const loadReport = async () => {
            try {
                const response = await ojtApi.get(params.id as string);
                const data = response.ojt as OjtReport;
                setReport(data);
                setFormData({
                    meeting: data.meeting,
                    documentationUrl: data.documentationUrl,
                    videoUrl: data.videoUrl || "",
                    observationUrl: data.observationUrl || "",
                    reflectionText: data.reflectionText || "",
                });
            } catch (error) {
                console.error("Failed to load OJT report:", error);
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await ojtApi.update(params.id as string, {
                meeting: formData.meeting,
                documentationUrl: formData.documentationUrl,
                videoUrl: formData.videoUrl || null,
                observationUrl: formData.observationUrl || null,
                reflectionText: formData.reflectionText || null,
            });
            router.push(`/ojt-management/${params.id}`);
        } catch (error) {
            console.error("Update OJT report error:", error);
            alert(error instanceof Error ? error.message : "Gagal memperbarui laporan OJT");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (!report) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <p className="text-slate-500 text-lg">Laporan OJT tidak ditemukan</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push(`/ojt-management/${params.id}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Edit Laporan OJT</h1>
                    <p className="text-slate-500 mt-1">Perbarui isi laporan Anda</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Laporan</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="meeting">Pertemuan</Label>
                            <Input
                                id="meeting"
                                type="number"
                                min={1}
                                max={2}
                                value={formData.meeting}
                                onChange={(e) => setFormData({...formData, meeting: Number(e.target.value)})}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="documentationUrl">URL Dokumentasi</Label>
                            <Input
                                id="documentationUrl"
                                type="url"
                                value={formData.documentationUrl}
                                onChange={(e) => setFormData({...formData, documentationUrl: e.target.value})}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="videoUrl">URL Video</Label>
                            <Input
                                id="videoUrl"
                                type="url"
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="observationUrl">URL Lembar Observasi</Label>
                            <Input
                                id="observationUrl"
                                type="url"
                                value={formData.observationUrl}
                                onChange={(e) => setFormData({...formData, observationUrl: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reflectionText">Refleksi</Label>
                            <Textarea
                                id="reflectionText"
                                value={formData.reflectionText}
                                onChange={(e) => setFormData({...formData, reflectionText: e.target.value})}
                                rows={5}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/ojt-management/${params.id}`)}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}