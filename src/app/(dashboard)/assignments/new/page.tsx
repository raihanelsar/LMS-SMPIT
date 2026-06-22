"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ArrowLeft} from "lucide-react";
import {assignmentsApi, programsApi} from "@/lib/api-client";
import type {Program} from "@/types";

export default function AssignmentNewPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "RPP" as "RPP" | "MATERI" | "OBSERVASI" | "REFLEKSI",
        deadline: "",
        programId: "",
    });

    useEffect(() => {
        programsApi
            .list()
            .then((response) => setPrograms((response.programs || []) as Program[]))
            .catch((error) => console.error("Failed to load programs:", error));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.programId || !formData.deadline) {
            alert("Program dan deadline wajib diisi");
            return;
        }

        setSaving(true);
        try {
            const response = await assignmentsApi.create({
                ...formData,
                deadline: new Date(formData.deadline).toISOString(),
            });
            router.push(`/assignments/${(response.assignment as {id: string}).id}`);
        } catch (error) {
            console.error("Create assignment error:", error);
            alert(error instanceof Error ? error.message : "Gagal membuat tugas");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/assignments")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Buat Tugas Baru</h1>
                    <p className="text-slate-500 mt-1">Tambahkan penugasan untuk program tertentu</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Tugas</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul Tugas</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Contoh: RPP Minggu ke-1"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Deskripsi tugas atau instruksi tambahan"
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Jenis Tugas</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) =>
                                        setFormData({...formData, type: value as "RPP" | "MATERI" | "OBSERVASI" | "REFLEKSI"})
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RPP">RPP</SelectItem>
                                        <SelectItem value="MATERI">Materi</SelectItem>
                                        <SelectItem value="OBSERVASI">Observasi</SelectItem>
                                        <SelectItem value="REFLEKSI">Refleksi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deadline">Deadline</Label>
                                <Input
                                    id="deadline"
                                    type="datetime-local"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="programId">Program</Label>
                            <Select
                                value={formData.programId}
                                onValueChange={(value) => setFormData({...formData, programId: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {programs.map((program) => (
                                        <SelectItem key={program.id} value={program.id}>
                                            {program.title} ({program.batch})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Membuat..." : "Buat Tugas"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.push("/assignments")}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}