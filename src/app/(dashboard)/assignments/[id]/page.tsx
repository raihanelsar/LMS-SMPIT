"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Calendar, Upload, FileText, CheckCircle2, Clock, AlertCircle, MessageSquare} from "lucide-react";
import {assignmentsApi, submissionsApi} from "@/lib/api-client";
import {useAuth} from "@/lib/auth-context";
import {LoadingPage} from "@/components/ui/loading";
import type {Assignment, Submission} from "@/types";

export default function AssignmentDetailPage() {
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadData, setUploadData] = useState({fileUrl: "", notes: ""});
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
    const params = useParams();
    const {user} = useAuth();

    const isPeserta = user?.role === "PESERTA";

    useEffect(() => {
        loadAssignmentData();
    }, [params.id]);

    const loadAssignmentData = async () => {
        try {
            const assignmentRes = await assignmentsApi.getById(params.id as string);
            setAssignment(assignmentRes.assignment);

            const submissionsRes = await submissionsApi.list({assignmentId: params.id as string});
            const userSubmissions = submissionsRes.submissions?.filter((s: Submission) => s.userId === user?.id) || [];
            setSubmissions(userSubmissions);
        } catch (error) {
            console.error("Error loading assignment:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            await submissionsApi.create({
                assignmentId: params.id as string,
                fileUrl: uploadData.fileUrl,
                notes: uploadData.notes,
            });
            await loadAssignmentData();
            setUploadData({fileUrl: "", notes: ""});
            setShowUploadForm(false);
            alert("Tugas berhasil diupload!");
        } catch (error) {
            console.error("Upload error:", error);
            alert("Gagal mengupload tugas");
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case "SUBMITTED":
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Menunggu Review
                    </Badge>
                );
            case "REVISION":
                return (
                    <Badge className="bg-orange-100 text-orange-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Perlu Revisi
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) return <LoadingPage />;
    if (!assignment) return <div>Assignment not found</div>;

    const latestSubmission = submissions.length > 0 ? submissions[submissions.length - 1] : null;
    const canSubmit = !latestSubmission || latestSubmission.status === "REVISION_REQUIRED";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/assignments")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900">{assignment.title}</h1>
                    <p className="text-slate-500 mt-1">{assignment.program?.title}</p>
                </div>
                <Badge variant="outline" className="text-sm">
                    {assignment.type}
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Tugas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {assignment.description && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-2">Deskripsi</h3>
                            <p className="text-slate-600">{assignment.description}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                        <div>
                            <p className="text-sm text-slate-500">Deadline</p>
                            <p className="font-medium text-slate-900 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(assignment.deadline).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Status Submission</p>
                            <p className="font-medium text-slate-900">
                                {latestSubmission ? getStatusBadge(latestSubmission.status) : "Belum submit"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isPeserta && canSubmit && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Upload Tugas</CardTitle>
                        <Button onClick={() => setShowUploadForm(!showUploadForm)} size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                        </Button>
                    </CardHeader>
                    {showUploadForm && (
                        <CardContent>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">URL File Tugas</label>
                                    <input
                                        type="url"
                                        value={uploadData.fileUrl}
                                        onChange={(e) => setUploadData({...uploadData, fileUrl: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                                        placeholder="https://drive.google.com/... atau URL file lainnya"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Upload file ke Google Drive, Dropbox, atau layanan cloud lainnya, lalu paste
                                        URL-nya di sini
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Catatan (Opsional)</label>
                                    <textarea
                                        value={uploadData.notes}
                                        onChange={(e) => setUploadData({...uploadData, notes: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                                        rows={3}
                                        placeholder="Tambahkan catatan untuk fasilitator..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={uploading} size="sm">
                                        {uploading ? "Mengupload..." : "Submit Tugas"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowUploadForm(false)}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    )}
                </Card>
            )}

            {submissions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Submission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {submissions.map((submission) => (
                                <div key={submission.id} className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-sm text-slate-500">
                                                Submitted:{" "}
                                                {new Date(submission.createdAt).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                            {getStatusBadge(submission.status)}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(submission.fileUrl, "_blank")}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Lihat File
                                        </Button>
                                    </div>

                                    {submission.notes && (
                                        <div className="mt-3 p-3 bg-slate-50 rounded-md">
                                            <p className="text-sm font-medium text-slate-700 mb-1">Catatan Anda:</p>
                                            <p className="text-sm text-slate-600">{submission.notes}</p>
                                        </div>
                                    )}

                                    {submission.feedback && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-900 mb-1">
                                                        Feedback dari Fasilitator:
                                                    </p>
                                                    <p className="text-sm text-blue-800">{submission.feedback}</p>
                                                    {submission.score && (
                                                        <p className="text-sm font-semibold text-blue-900 mt-2">
                                                            Score: {submission.score}/100
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
