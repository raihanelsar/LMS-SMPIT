"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {BookOpen, Plus, Search, Users, FileText, ClipboardList} from "lucide-react";
import {programsApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";
import type {Program} from "@/types";

export default function ProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        programsApi
        .list()
        .then((data) => {
            setPrograms(data.programs || []);
        })
        .finally(() => setLoading(false));
    }, []);

    const filteredPrograms = programs.filter(
        (program) =>
            program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            program.batch?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <LoadingPage />;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "DRAFT":
                return "secondary";
            case "PUBLISHED":
                return "default";
            case "RUNNING":
                return "success";
            case "COMPLETED":
                return "outline";
            default:
                return "secondary";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "DRAFT":
                return "Draft";
            case "PUBLISHED":
                return "Published";
            case "RUNNING":
                return "Running";
            case "COMPLETED":
                return "Completed";
            default:
                return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Programs</h1>
                    <p className="text-slate-500 mt-1">Kelola program pembelajaran</p>
                </div>
                <Button onClick={() => router.push("/programs/new")}>
                    <Plus className="h-4 w-4" />
                    Buat Program
                </Button>
            </div>

            <Card>
                <CardContent className="py-4">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari program berdasarkan nama atau batch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11"
                        />
                    </div>
                </CardContent>
            </Card>

            {filteredPrograms.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Tidak ada program ditemukan</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPrograms.map((program) => (
                        <Card
                            key={program.id}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => router.push(`/programs/${program.id}`)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <Badge
                                        variant={
                                            getStatusColor(program.status) as
                                                | "default"
                                                | "secondary"
                                                | "destructive"
                                                | "outline"
                                        }
                                    >
                                        {getStatusLabel(program.status)}
                                    </Badge>
                                    <span className="text-xs text-slate-500">Batch {program.batch}</span>
                                </div>
                                <CardTitle className="line-clamp-2">{program.title}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {program.description || "Tidak ada deskripsi"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Durasi:</span>
                                        <span className="font-medium text-slate-900">
                                            {new Date(program.startDate).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                            })}{" "}
                                            -{" "}
                                            {new Date(program.endDate).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 pt-3 border-t border-slate-200">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <Users className="h-4 w-4" />
                                            <span>{program._count?.users || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <FileText className="h-4 w-4" />
                                            <span>{program._count?.materials || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <ClipboardList className="h-4 w-4" />
                                            <span>{program._count?.assignments || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
