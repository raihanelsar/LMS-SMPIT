"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ArrowLeft} from "lucide-react";
import {usersApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export default function UserEditPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const params = useParams();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
    });

    useEffect(() => {
        usersApi
        .get(params.id as string)
        .then((response) => {
            const userData = response.user as User;
            setUser(userData);
            setFormData({
                name: userData.name,
                email: userData.email,
                password: "",
                role: userData.role,
            });
        })
        .finally(() => setLoading(false));
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updateData: Partial<User> & {password?: string} = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            await usersApi.update(params.id as string, updateData);
            router.push(`/users/${params.id}`);
        } catch (error) {
            console.error("Update error:", error);
            alert(error instanceof Error ? error.message : "Gagal memperbarui pengguna");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (!user) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <p className="text-slate-600 font-medium">Pengguna tidak ditemukan</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push(`/users/${params.id}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Edit Pengguna</h1>
                    <p className="text-slate-500 mt-1">Perbarui informasi pengguna</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Pengguna</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password Baru (opsional)</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="Kosongkan untuk mempertahankan password saat ini"
                                minLength={6}
                            />
                            <p className="text-xs text-slate-500">
                                Kosongkan untuk mempertahankan password saat ini. Jika diubah, minimal 6 karakter.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Peran</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({...formData, role: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                    <SelectItem value="FACILITATOR">Fasilitator</SelectItem>
                                    <SelectItem value="PESERTA">Peserta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.push(`/users/${params.id}`)}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
