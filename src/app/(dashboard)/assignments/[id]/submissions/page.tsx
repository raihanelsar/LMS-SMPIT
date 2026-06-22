"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import {submissionsApi} from "@/lib/api-client";
import type {Submission} from "@/types";

export default function AssignmentSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        submissionsApi
            .list({assignmentId: params.id as string})
            .then((response) => setSubmissions((response.submissions || []) as Submission[]))
            .catch((error) => console.error("Error loading submissions:", error));
    }, [params.id]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push(`/assignments/${params.id}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Submissions</h1>
                    <p className="text-slate-500 mt-1">Daftar hasil pengumpulan tugas</p>
                </div>
            </div>

            <Card>
                <CardContent className="py-8">
                    {submissions.length === 0 ? (
                        <p className="text-center text-slate-500">Belum ada submission</p>
                    ) : (
                        <ul className="space-y-3">
                            {submissions.map((submission) => (
                                <li key={submission.id} className="border rounded-md p-3">
                                    <p className="font-medium">{submission.user?.name || "Unknown"}</p>
                                    <p className="text-sm text-slate-500">Status: {submission.status}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}