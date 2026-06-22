"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowLeft} from "lucide-react";
import {ojtApi} from "@/lib/api-client";

export default function OjtNewPage() {
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        meeting: 1,
        documentationUrl: "",
        videoUrl: "",
        observationUrl: "",
        reflectionText: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await ojtApi.create({
                meeting: formData.meeting,
                documentationUrl: formData.documentationUrl,
                videoUrl: formData.videoUrl || undefined,
                observationUrl: formData.observationUrl || undefined,
                reflectionText: formData.reflectionText || undefined,
            });
            router.push(`/ojt-management/${(response.ojtReport as {id: string}).id}`);
        } catch (error) {
            console.error("Create OJT report error:", error);
            alert(error instanceof Error ? error.message : "Gagal membuat laporan OJT");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/ojt-management")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Tambah Laporan OJT</h1>
                    <p className="text-slate-500 mt-1">Buat laporan baru untuk monitoring OJT</p>
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
                                {saving ? "Menyimpan..." : "Simpan Laporan"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.push("/ojt-management")}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}