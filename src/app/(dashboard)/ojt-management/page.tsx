"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Briefcase, Calendar, FileText, Plus, Upload, Eye} from "lucide-react";
import {ojtApi} from "@/lib/api-client";
import {useAuth} from "@/lib/auth-context";
import {LoadingPage} from "@/components/ui/loading";
import type {OjtReport} from "@/types";

export default function OjtManagementPage() {
    const [reports, setReports] = useState<OjtReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadData, setUploadData] = useState({
        meeting: 1,
        documentationUrl: "",
        videoUrl: "",
        observationUrl: "",
        reflectionText: "",
        studentProducts: [] as string[],
    });
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
    const {user} = useAuth();

    const isPeserta = user?.role === "PESERTA";
    const isFasilitator = user?.role === "FACILITATOR" || user?.role === "SUPER_ADMIN";

    useEffect(() => {
        loadOjtReports();
    }, []);

    const loadOjtReports = async () => {
        try {
            const data = await ojtApi.list();
            setReports((data.ojtReports || []) as OjtReport[]);
        } catch (error) {
            console.error("Error loading OJT reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            await ojtApi.create({
                meeting: uploadData.meeting,
                documentationUrl: uploadData.documentationUrl,
                videoUrl: uploadData.videoUrl || undefined,
                observationUrl: uploadData.observationUrl || undefined,
                reflectionText: uploadData.reflectionText || undefined,
                studentProducts: uploadData.studentProducts.map((url) => ({fileUrl: url})),
            });
            await loadOjtReports();
            setUploadData({
                meeting: 1,
                documentationUrl: "",
                videoUrl: "",
                observationUrl: "",
                reflectionText: "",
                studentProducts: [],
            });
            setShowUploadForm(false);
            alert("Laporan OJT berhasil diupload!");
        } catch (error: any) {
            console.error("Upload error:", error);
            alert(error.message || "Gagal mengupload laporan OJT");
        } finally {
            setUploading(false);
        }
    };

    const addStudentProduct = () => {
        setUploadData({...uploadData, studentProducts: [...uploadData.studentProducts, ""]});
    };

    const updateStudentProduct = (index: number, url: string) => {
        const updated = [...uploadData.studentProducts];
        updated[index] = url;
        setUploadData({...uploadData, studentProducts: updated});
    };

    const removeStudentProduct = (index: number) => {
        const updated = uploadData.studentProducts.filter((_, i) => i !== index);
        setUploadData({...uploadData, studentProducts: updated});
    };

    const handleApprove = async (id: string) => {
        try {
            await ojtApi.update(id, {status: "APPROVED"});
            await loadOjtReports();
            alert("Laporan OJT berhasil disetujui!");
        } catch (error) {
            console.error("Approve error:", error);
            alert("Gagal menyetujui laporan");
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    const meeting1Reports = reports.filter((r) => r.meeting === 1);
    const meeting2Reports = reports.filter((r) => r.meeting === 2);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "warning";
            case "SUBMITTED":
                return "default";
            case "APPROVED":
                return "success";
            case "REJECTED":
                return "destructive";
            default:
                return "secondary";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Menunggu";
            case "SUBMITTED":
                return "Dikirim";
            case "APPROVED":
                return "Disetujui";
            case "REJECTED":
                return "Ditolak";
            default:
                return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manajemen OJT</h1>
                    <p className="text-slate-500 mt-1">Laporan dan artifacts On-the-Job Training</p>
                </div>
                {isPeserta && (
                    <Button onClick={() => setShowUploadForm(!showUploadForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Laporan OJT
                    </Button>
                )}
            </div>

            {isPeserta && showUploadForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Laporan OJT</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Pertemuan</label>
                                <select
                                    value={uploadData.meeting}
                                    onChange={(e) => setUploadData({...uploadData, meeting: parseInt(e.target.value)})}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                                >
                                    <option value={1}>Pertemuan 1</option>
                                    <option value={2}>Pertemuan 2</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    URL Dokumentasi (Foto/Video Pembelajaran) *
                                </label>
                                <Input
                                    type="url"
                                    value={uploadData.documentationUrl}
                                    onChange={(e) => setUploadData({...uploadData, documentationUrl: e.target.value})}
                                    placeholder="https://drive.google.com/... atau URL lainnya"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {uploadData.meeting === 1
                                        ? "Upload maksimal 4 foto bukti lapangan atau link video mengajar"
                                        : "Upload dokumentasi tambahan pembelajaran"}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    URL Video Pembelajaran (Opsional)
                                </label>
                                <Input
                                    type="url"
                                    value={uploadData.videoUrl}
                                    onChange={(e) => setUploadData({...uploadData, videoUrl: e.target.value})}
                                    placeholder="https://youtube.com/... atau URL video lainnya"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    URL Lembar Observasi (Opsional)
                                </label>
                                <Input
                                    type="url"
                                    value={uploadData.observationUrl}
                                    onChange={(e) => setUploadData({...uploadData, observationUrl: e.target.value})}
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Refleksi Diri (Opsional)</label>
                                <Textarea
                                    value={uploadData.reflectionText}
                                    onChange={(e) => setUploadData({...uploadData, reflectionText: e.target.value})}
                                    rows={4}
                                    placeholder="Tuliskan refleksi Anda tentang pelaksanaan pembelajaran..."
                                />
                            </div>

                            {uploadData.meeting === 2 && (
                                <div>
                                    <label className="text-sm font-medium text-slate-700">
                                        Produk/Karya Siswa (URL)
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">
                                        Upload produk inovasi atau karya tugas siswa SMP (hasil Discovery Learning)
                                    </p>
                                    {uploadData.studentProducts.map((url, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                type="url"
                                                value={url}
                                                onChange={(e) => updateStudentProduct(index, e.target.value)}
                                                placeholder="https://drive.google.com/..."
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeStudentProduct(index)}
                                            >
                                                Hapus
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addStudentProduct}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tambah Produk Siswa
                                    </Button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={uploading}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploading ? "Mengupload..." : "Submit Laporan"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {reports.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Briefcase className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Belum ada laporan OJT</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">Pertemuan 1</h2>
                        {meeting1Reports.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-slate-500">
                                    Belum ada laporan untuk Pertemuan 1
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {meeting1Reports.map((report) => (
                                    <Card key={report.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl text-slate-900 mb-1">
                                                        Laporan OJT Pertemuan {report.meeting}
                                                    </CardTitle>
                                                    <p className="text-sm text-slate-500">
                                                        {report.user?.name || "Unknown"}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        getStatusColor(report.status) as
                                                            | "default"
                                                            | "secondary"
                                                            | "destructive"
                                                            | "outline"
                                                    }
                                                >
                                                    {getStatusLabel(report.status)}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Dikirim:</span>
                                                    </div>
                                                    <span className="font-medium text-slate-900">
                                                        {new Date(report.createdAt).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-200">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <FileText className="h-4 w-4" />
                                                        <span>Produk Siswa:</span>
                                                    </div>
                                                    <span className="font-medium text-slate-900">
                                                        {report.studentProducts.length} file
                                                    </span>
                                                </div>
                                                {isFasilitator && report.status === "SUBMITTED" && (
                                                    <div className="flex gap-2 pt-3">
                                                        <Button size="sm" onClick={() => handleApprove(report.id)}>
                                                            Setujui
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => router.push(`/ojt-management/${report.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Lihat Detail
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">Pertemuan 2</h2>
                        {meeting2Reports.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-slate-500">
                                    Belum ada laporan untuk Pertemuan 2
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {meeting2Reports.map((report) => (
                                    <Card key={report.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl text-slate-900 mb-1">
                                                        Laporan OJT Pertemuan {report.meeting}
                                                    </CardTitle>
                                                    <p className="text-sm text-slate-500">
                                                        {report.user?.name || "Unknown"}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        getStatusColor(report.status) as
                                                            | "default"
                                                            | "secondary"
                                                            | "destructive"
                                                            | "outline"
                                                    }
                                                >
                                                    {getStatusLabel(report.status)}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Dikirim:</span>
                                                    </div>
                                                    <span className="font-medium text-slate-900">
                                                        {new Date(report.createdAt).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-200">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <FileText className="h-4 w-4" />
                                                        <span>Produk Siswa:</span>
                                                    </div>
                                                    <span className="font-medium text-slate-900">
                                                        {report.studentProducts.length} file
                                                    </span>
                                                </div>
                                                {isFasilitator && report.status === "SUBMITTED" && (
                                                    <div className="flex gap-2 pt-3">
                                                        <Button size="sm" onClick={() => handleApprove(report.id)}>
                                                            Setujui
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => router.push(`/ojt-management/${report.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Lihat Detail
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
