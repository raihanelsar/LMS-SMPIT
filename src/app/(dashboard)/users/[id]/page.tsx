"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ArrowLeft, Edit, Trash2, Mail, Calendar, Briefcase, FileText, BookOpen} from "lucide-react";
import {usersApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";

type ProgramUser = {
    id: string;
    programId: string;
    program?: {
        id: string;
        title: string;
        batch: string;
        status: string;
    };
};

type Submission = {
    id: string;
    assignmentId: string;
    assignment?: {
        id: string;
        title: string;
    };
    status: string;
    score?: number;
    submittedAt: string;
};

type OjtReport = {
    id: string;
    meeting: number;
    status: string;
    createdAt: string;
};

type Reflection = {
    id: string;
    type: string;
    program?: {
        id: string;
        title: string;
    };
    createdAt: string;
};

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    programs: ProgramUser[];
    submissions: Submission[];
    ojtReports: OjtReport[];
    reflections: Reflection[];
};

export default function UserDetailPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        usersApi
        .get(params.id as string)
        .then((response) => {
            setUser(response.user as User);
        })
        .finally(() => setLoading(false));
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${user?.name}?`)) return;

        try {
            await usersApi.delete(params.id as string);
            router.push("/users");
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "SUPER_ADMIN":
                return "destructive";
            case "FACILITATOR":
                return "default";
            case "PESERTA":
                return "success";
            default:
                return "secondary";
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (!user) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <p className="text-slate-600 font-medium">User tidak ditemukan</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push("/users")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                            <Badge
                                variant={
                                    getRoleBadgeColor(user.role) as
                                        | "default"
                                        | "secondary"
                                        | "destructive"
                                        | "outline"
                                        | "success"
                                }
                            >
                                {user.role.replace("_", " ")}
                            </Badge>
                        </div>
                        <p className="text-slate-600 mt-1">{user.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push(`/users/${params.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                    </Button>
                </div>
            </div>

            {/* User Info Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                            <Mail className="h-4 w-4 text-blue-600" />
                            Email
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-700">{user.email}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                            <Calendar className="h-4 w-4 text-indigo-600" />
                            Bergabung
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-700">
                            {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                            <Briefcase className="h-4 w-4 text-amber-600" />
                            Role
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-700">{user.role.replace("_", " ")}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Related Data */}
            <Tabs defaultValue="programs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="programs">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Program ({user.programs?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="submissions">
                        <FileText className="h-4 w-4 mr-2" />
                        Submission ({user.submissions?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="ojt">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Laporan OJT ({user.ojtReports?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="reflections">
                        <FileText className="h-4 w-4 mr-2" />
                        Refleksi ({user.reflections?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Programs Tab */}
                <TabsContent value="programs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Program yang Diikuti</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.programs?.length === 0 ? (
                                <p className="text-center text-slate-600 py-8">Belum ada program yang diikuti</p>
                            ) : (
                                <div className="space-y-3">
                                    {user.programs?.map((pu: ProgramUser) => (
                                        <div
                                            key={pu.id}
                                            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{pu.program?.title}</h4>
                                                <p className="text-sm text-slate-600">
                                                    Batch: {pu.program?.batch} • Status: {pu.program?.status}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/programs/${pu.program?.id}`)}
                                            >
                                                Lihat
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Submissions Tab */}
                <TabsContent value="submissions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.submissions?.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No submissions yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {user.submissions?.map((sub: Submission) => (
                                        <div
                                            key={sub.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div>
                                                <h4 className="font-medium">{sub.assignment?.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Status: {sub.status} • Score: {sub.score || "Not graded"}
                                                </p>
                                            </div>
                                            <Badge>{sub.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* OJT Tab */}
                <TabsContent value="ojt">
                    <Card>
                        <CardHeader>
                            <CardTitle>OJT Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.ojtReports?.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No OJT reports yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {user.ojtReports?.map((ojt: OjtReport) => (
                                        <div
                                            key={ojt.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div>
                                                <h4 className="font-medium">Meeting {ojt.meeting}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Status: {ojt.status} •{" "}
                                                    {new Date(ojt.createdAt).toLocaleDateString("id-ID")}
                                                </p>
                                            </div>
                                            <Badge>{ojt.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reflections Tab */}
                <TabsContent value="reflections">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reflections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.reflections?.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No reflections yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {user.reflections?.map((ref: Reflection) => (
                                        <div
                                            key={ref.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div>
                                                <h4 className="font-medium">{ref.program?.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Type: {ref.type} •{" "}
                                                    {new Date(ref.createdAt).toLocaleDateString("id-ID")}
                                                </p>
                                            </div>
                                            <Badge variant="outline">{ref.type}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
