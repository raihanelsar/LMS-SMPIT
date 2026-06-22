"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Calendar, User} from "lucide-react";
import {reflectionsApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";
import type {Reflection} from "@/types";

export default function ReflectionDetailPage() {
    const [reflection, setReflection] = useState<Reflection | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const loadReflection = async () => {
            try {
                const response = await reflectionsApi.get(params.id as string);
                setReflection(response.reflection as Reflection);
            } catch (error) {
                console.error("Failed to load reflection:", error);
            } finally {
                setLoading(false);
            }
        };

        loadReflection();
    }, [params.id]);

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

    const response = reflection.response as Record<string, string>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/reflections")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Detail Refleksi</h1>
                    <p className="text-slate-500 mt-1">{reflection.program?.title || "Program"}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{reflection.program?.title}</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">Oleh {reflection.user?.name || "Unknown"}</p>
                        </div>
                        <Badge>{reflection.type === "TEACHER" ? "Refleksi Guru" : "Refleksi Siswa"}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(reflection.createdAt).toLocaleDateString("id-ID")}</span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Kekuatan</p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{response.kekuatan || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Kelemahan</p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{response.kelemahan || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Rencana Perbaikan</p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{response.rencanaPerbaikan || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Catatan Tambahan</p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{response.catatanTambahan || "-"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}