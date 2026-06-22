"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ArrowLeft} from "lucide-react";
import {assignmentsApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";

type Assignment = {
    id: string;
    title: string;
    description?: string;
    type: string;
    deadline: string;
    programId: string;
};

export default function AssignmentEditPage() {
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const params = useParams();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "RPP",
        deadline: "",
    });

    useEffect(() => {
        const loadAssignment = async () => {
            try {
                const response = await assignmentsApi.getById(params.id as string);
                const data = response.assignment as Assignment;
                setAssignment(data);
                setFormData({
                    title: data.title,
                    description: data.description || "",
                    type: data.type,
                    deadline: data.deadline ? new Date(data.deadline).toISOString().slice(0, 16) : "",
                });
            } catch (error) {
                console.error("Failed to load assignment:", error);
            } finally {
                setLoading(false);
            }
        };

        loadAssignment();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await assignmentsApi.update(params.id as string, {
                ...formData,
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
            });
            router.push(`/assignments/${params.id}`);
        } catch (error) {
            console.error("Update assignment error:", error);
            alert(error instanceof Error ? error.message : "Gagal memperbarui tugas");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (!assignment) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <p className="text-slate-500 text-lg">Tugas tidak ditemukan</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push(`/assignments/${params.id}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Edit Tugas</h1>
                    <p className="text-slate-500 mt-1">Perbarui informasi penugasan</p>
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
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Jenis Tugas</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({...formData, type: value})}
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

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/assignments/${params.id}`)}
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