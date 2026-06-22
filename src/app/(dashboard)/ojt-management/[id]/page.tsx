"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Calendar, ExternalLink, FileText, Video} from "lucide-react";
import {ojtApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";
import type {OjtReport} from "@/types";

export default function OjtDetailPage() {
    const [report, setReport] = useState<OjtReport | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const loadReport = async () => {
            try {
                const response = await ojtApi.get(params.id as string);
                const reportData = (response.ojt ?? response) as OjtReport;
                setReport(reportData);
            } catch (error) {
                console.error("Failed to load OJT report:", error);
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [params.id]);

    const getStatusColor = (
        status: string
    ): "warning" | "default" | "success" | "secondary" => {
        switch (status) {
            case "PENDING":
                return "warning";
            case "SUBMITTED":
                return "default";
            case "APPROVED":
                return "success";
            default:
                return "secondary";
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
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/ojt-management")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Detail Laporan OJT</h1>
                    <p className="text-slate-500 mt-1">Pertemuan {report.meeting}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Laporan OJT Pertemuan {report.meeting}</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">Oleh {report.user?.name || "Unknown"}</p>
                        </div>
                        <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(report.createdAt).toLocaleDateString("id-ID")}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Dokumentasi</p>
                            <a
                                href={report.documentationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Buka URL Dokumentasi
                            </a>
                        </div>
                        {report.videoUrl && (
                            <div>
                                <p className="text-sm font-medium text-slate-700">Video</p>
                                <a
                                    href={report.videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                    <Video className="h-4 w-4" />
                                    Buka Video
                                </a>
                            </div>
                        )}
                        {report.observationUrl && (
                            <div>
                                <p className="text-sm font-medium text-slate-700">Lembar Observasi</p>
                                <a
                                    href={report.observationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                    <FileText className="h-4 w-4" />
                                    Buka Lembar Observasi
                                </a>
                            </div>
                        )}
                    </div>

                    {report.reflectionText && (
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">Refleksi</p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{report.reflectionText}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}