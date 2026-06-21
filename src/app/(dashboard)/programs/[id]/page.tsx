"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Users,
    FileText,
    ClipboardList,
    Calendar,
    Upload,
    Plus,
    ExternalLink,
    Briefcase,
    MessageSquare,
} from "lucide-react";
import {programsApi, materialsApi, assignmentsApi, usersApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";
import {useAuth} from "@/lib/auth-context";
import type {Program, Material, Assignment, User} from "@/types";

type ProgramUser = {
    id: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
};

type ProgramDetail = Program & {
    users: ProgramUser[];
    materials: Material[];
    assignments: Assignment[];
    reflections: any[];
};

export default function ProgramDetailPage() {
    const [program, setProgram] = useState<ProgramDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [materialData, setMaterialData] = useState({title: "", fileUrl: "", type: "PDF"});
    const [uploading, setUploading] = useState(false);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const router = useRouter();
    const params = useParams();
    const {user} = useAuth();

    const isFasilitatorOrAdmin = user?.role === "FACILITATOR" || user?.role === "SUPER_ADMIN";

    useEffect(() => {
        programsApi
        .get(params.id as string)
        .then((response) => {
            setProgram(response.program as ProgramDetail);
        })
        .finally(() => setLoading(false));
    }, [params.id]);

    useEffect(() => {
        if (showAddUserForm && program) {
            // Load available users that are not yet assigned to this program
            usersApi
            .list()
            .then((response) => {
                const allUsers = response.users as User[];
                const assignedUserIds = program.users?.map((pu) => pu.user?.id) || [];
                const available = allUsers.filter((u) => !assignedUserIds.includes(u.id));
                setAvailableUsers(available);
            })
            .catch((error) => {
                console.error("Error loading users:", error);
            });
        }
    }, [showAddUserForm, program]);

    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus program ini?")) return;

        try {
            await programsApi.delete(params.id as string);
            router.push("/programs");
        } catch (error) {
            console.error("Delete error:", error);
            alert("Gagal menghapus program");
        }
    };

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            await materialsApi.create({
                ...materialData,
                programId: params.id as string,
            });
            // Refresh program data
            const response = await programsApi.get(params.id as string);
            setProgram(response.program as ProgramDetail);
            setMaterialData({title: "", fileUrl: "", type: "PDF"});
            setShowMaterialForm(false);
            alert("Materi berhasil ditambahkan");
        } catch (error) {
            console.error("Add material error:", error);
            alert("Gagal menambahkan materi");
        } finally {
            setUploading(false);
        }
    };

    const getMaterialIcon = (type: string) => {
        switch (type) {
            case "PDF":
                return "📄";
            case "PPTX":
                return "📊";
            case "VIDEO":
                return "🎥";
            case "LINK":
                return "🔗";
            default:
                return "📁";
        }
    };

    const handleAssignUser = async () => {
        if (!selectedUserId) {
            alert("Pilih user terlebih dahulu");
            return;
        }

        try {
            await programsApi.assignUser(params.id as string, selectedUserId);
            // Refresh program data
            const response = await programsApi.get(params.id as string);
            setProgram(response.program as ProgramDetail);
            setShowAddUserForm(false);
            setSelectedUserId("");
            alert("User berhasil ditambahkan ke program");
        } catch (error) {
            console.error("Error assigning user:", error);
            alert("Gagal menambahkan user ke program");
        }
    };

    const handleRemoveUser = async (userId: string, userName: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus ${userName} dari program ini?`)) {
            return;
        }

        try {
            await programsApi.removeUser(params.id as string, userId);
            // Refresh program data
            const response = await programsApi.get(params.id as string);
            setProgram(response.program as ProgramDetail);
            alert("User berhasil dihapus dari program");
        } catch (error) {
            console.error("Error removing user:", error);
            alert("Gagal menghapus user dari program");
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (!program) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <p className="text-slate-500 text-lg">Program tidak ditemukan</p>
                </CardContent>
            </Card>
        );
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
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push("/programs")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{program.title}</h1>
                        <p className="text-slate-500 mt-1">Batch {program.batch}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/programs/${params.id}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                        Hapus
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Informasi Program</CardTitle>
                        <Badge
                            variant={
                                getStatusColor(program.status) as "default" | "secondary" | "destructive" | "outline"
                            }
                        >
                            {getStatusLabel(program.status)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {program.description && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-2">Deskripsi</h3>
                            <p className="text-slate-600">{program.description}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                        <div>
                            <p className="text-sm text-slate-500">Tanggal Mulai</p>
                            <p className="font-medium text-slate-900 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(program.startDate).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Tanggal Selesai</p>
                            <p className="font-medium text-slate-900 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(program.endDate).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="materials">Materi ({program.materials?.length || 0})</TabsTrigger>
                    <TabsTrigger value="assignments">Tugas ({program.assignments?.length || 0})</TabsTrigger>
                    <TabsTrigger value="participants">Peserta ({program.users?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Peserta
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-slate-900">{program.users?.length || 0}</p>
                                <p className="text-sm text-slate-500 mt-1">Total peserta terdaftar</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    Materi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-slate-900">{program.materials?.length || 0}</p>
                                <p className="text-sm text-slate-500 mt-1">Total materi pembelajaran</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-indigo-600" />
                                    Tugas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-slate-900">{program.assignments?.length || 0}</p>
                                <p className="text-sm text-slate-500 mt-1">Total tugas yang diberikan</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="materials" className="space-y-4">
                    {isFasilitatorOrAdmin && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Tambah Materi</CardTitle>
                                <Button onClick={() => setShowMaterialForm(!showMaterialForm)} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah
                                </Button>
                            </CardHeader>
                            {showMaterialForm && (
                                <CardContent>
                                    <form onSubmit={handleAddMaterial} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Judul Materi</label>
                                            <input
                                                type="text"
                                                value={materialData.title}
                                                onChange={(e) =>
                                                    setMaterialData({...materialData, title: e.target.value})
                                                }
                                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Jenis Materi</label>
                                            <select
                                                value={materialData.type}
                                                onChange={(e) =>
                                                    setMaterialData({...materialData, type: e.target.value})
                                                }
                                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                                            >
                                                <option value="PDF">PDF</option>
                                                <option value="PPTX">Presentasi (PPTX)</option>
                                                <option value="VIDEO">Video</option>
                                                <option value="LINK">Link Eksternal</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700">
                                                {materialData.type === "LINK" ? "URL Link" : "URL File"}
                                            </label>
                                            <input
                                                type="url"
                                                value={materialData.fileUrl}
                                                onChange={(e) =>
                                                    setMaterialData({...materialData, fileUrl: e.target.value})
                                                }
                                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                                                placeholder="https://..."
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={uploading} size="sm">
                                                {uploading ? "Menyimpan..." : "Simpan"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowMaterialForm(false)}
                                            >
                                                Batal
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            )}
                        </Card>
                    )}

                    {program.materials?.length > 0 ? (
                        <div className="grid gap-4">
                            {program.materials.map((material: Material) => (
                                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="text-3xl">{getMaterialIcon(material.type)}</div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{material.title}</h3>
                                                    <Badge variant="outline" className="mt-1">
                                                        {material.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(material.fileUrl, "_blank")}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 text-lg">Belum ada materi</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="assignments">
                    {program.assignments?.length > 0 ? (
                        <div className="grid gap-4">
                            {program.assignments.map((assignment: Assignment) => (
                                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-slate-900 text-lg">
                                                    {assignment.title}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <Badge variant="outline">{assignment.type}</Badge>
                                                    <span className="text-sm text-slate-500">
                                                        Deadline:{" "}
                                                        {new Date(assignment.deadline).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push("/assignments")}
                                            >
                                                <ClipboardList className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <ClipboardList className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 text-lg">Belum ada tugas</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="participants">
                    {isFasilitatorOrAdmin && (
                        <Card className="mb-4">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Tambah Peserta</CardTitle>
                                <Button onClick={() => setShowAddUserForm(!showAddUserForm)} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah User
                                </Button>
                            </CardHeader>
                            {showAddUserForm && (
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Pilih User</label>
                                            <select
                                                value={selectedUserId}
                                                onChange={(e) => setSelectedUserId(e.target.value)}
                                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                                            >
                                                <option value="">-- Pilih User --</option>
                                                {availableUsers.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name} ({u.email}) - {u.role}
                                                    </option>
                                                ))}
                                            </select>
                                            {availableUsers.length === 0 && (
                                                <p className="text-sm text-slate-500 mt-2">
                                                    Semua user sudah terdaftar di program ini
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleAssignUser} disabled={!selectedUserId} size="sm">
                                                Tambahkan
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setShowAddUserForm(false);
                                                    setSelectedUserId("");
                                                }}
                                            >
                                                Batal
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    )}

                    {program.users && program.users.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Peserta</CardTitle>
                                <p className="text-sm text-slate-500 mt-1">Peserta yang terdaftar dalam program ini</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {program.users.map((pu: ProgramUser) => (
                                        <div
                                            key={pu.id}
                                            className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-900">{pu.user?.name}</p>
                                                <p className="text-sm text-slate-500">{pu.user?.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">{pu.user?.role}</Badge>
                                                {isFasilitatorOrAdmin && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemoveUser(pu.user?.id || "", pu.user?.name || "")
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 text-lg">Belum ada peserta</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
