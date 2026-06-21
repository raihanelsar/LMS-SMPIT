"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ClipboardList, Calendar, Users, ExternalLink} from "lucide-react";
import {programsApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";

type Submission = {
    id: string;
    status: string;
    submittedAt: string;
};

type Program = {
    id: string;
    title: string;
    assignments?: Assignment[];
};

type Assignment = {
    id: string;
    title: string;
    type: string;
    deadline: string;
    program: {
        title: string;
    };
    submissions: Submission[];
};

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        programsApi
        .list()
        .then((data) => {
            const allAssignments =
                data.programs?.flatMap(
                    (p: Program) =>
                        p.assignments?.map((a: Assignment) => ({
                            ...a,
                            program: {title: p.title},
                        })) || []
                ) || [];
            setAssignments(allAssignments as Assignment[]);
        })
        .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <LoadingPage />;
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case "RPP":
                return "default";
            case "MATERI":
                return "success";
            case "OBSERVASI":
                return "warning";
            case "REFLEKSI":
                return "secondary";
            default:
                return "secondary";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Tugas</h1>
                <p className="text-slate-500 mt-1">Lihat dan kelola semua tugas pembelajaran</p>
            </div>

            {assignments.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <ClipboardList className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Belum ada tugas</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {assignments.map((assignment) => (
                        <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl text-slate-900 mb-1">
                                            {assignment.title}
                                        </CardTitle>
                                        <p className="text-sm text-slate-500">Program: {assignment.program.title}</p>
                                    </div>
                                    <Badge
                                        variant={
                                            getTypeColor(assignment.type) as
                                                | "default"
                                                | "secondary"
                                                | "destructive"
                                                | "outline"
                                        }
                                    >
                                        {assignment.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                Deadline:{" "}
                                                {new Date(assignment.deadline).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Users className="h-4 w-4" />
                                            <span>{assignment.submissions?.length || 0} submission</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/assignments/${assignment.id}`)}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Detail
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
