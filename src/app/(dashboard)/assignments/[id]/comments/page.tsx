"use client";

import {useRouter, useParams} from "next/navigation";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";

export default function AssignmentCommentsPage() {
    const router = useRouter();
    const params = useParams();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push(`/assignments/${params.id}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Komentar Tugas</h1>
                </div>
            </div>

            <Card>
                <CardContent className="py-16 text-center">
                    <p className="text-slate-500">Komentar tugas akan dikembangkan lebih lanjut.</p>
                </CardContent>
            </Card>
        </div>
    );
}