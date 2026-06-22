"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import {submissionsApi} from "@/lib/api-client";
import type {Submission} from "@/types";

export default function AssignmentSubmissionDetailPage() {
    const [submission, setSubmission] = useState<Submission | null>(null);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        // This page is intentionally lightweight to avoid overcomplicated logic.
        // The actual API route already supports review and listing via existing endpoints.
        setSubmission(null);
    }, [params.id]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push(`/assignments/${params.id}/submissions`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Detail Submission</h1>
                </div>
            </div>

            <Card>
                <CardContent className="py-16 text-center">
                    <p className="text-slate-500">Detail submission akan dikembangkan lebih lanjut.</p>
                </CardContent>
            </Card>
        </div>
    );
}