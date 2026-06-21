"use client";

import {useEffect, useState, useRef} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Users, Plus, Search, Edit, Trash2, Mail, Calendar, Upload, Download, FileText, X, Check} from "lucide-react";
import {usersApi} from "@/lib/api-client";
import {LoadingPage} from "@/components/ui/loading";
import type {UserWithCounts} from "@/types";

type CsvPreviewRow = {
    name: string;
    email: string;
    password: string;
    role?: string;
    institution?: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<UserWithCounts[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);
    const [csvPreview, setCsvPreview] = useState<CsvPreviewRow[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const params = roleFilter === "all" ? undefined : {role: roleFilter};
                const response = await usersApi.list(params);
                setUsers((response.users || []) as UserWithCounts[]);
            } catch (error) {
                console.error("Fetch users error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [roleFilter]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setImportResult(null);

        // Parse CSV for preview
        try {
            const text = await file.text();
            const lines = text.split("\n").filter((line) => line.trim());
            const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

            const nameIdx = headers.indexOf("name");
            const emailIdx = headers.indexOf("email");
            const passwordIdx = headers.indexOf("password");
            const roleIdx = headers.indexOf("role");
            const institutionIdx = headers.indexOf("institution");

            if (nameIdx === -1 || emailIdx === -1 || passwordIdx === -1) {
                alert("CSV must contain name, email, and password columns");
                setSelectedFile(null);
                setCsvPreview([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            const preview: CsvPreviewRow[] = [];
            for (let i = 1; i < Math.min(lines.length, 11); i++) {
                const values = lines[i].split(",").map((v) => v.trim());
                preview.push({
                    name: values[nameIdx] || "",
                    email: values[emailIdx] || "",
                    password: values[passwordIdx] || "",
                    role: roleIdx !== -1 ? values[roleIdx] : undefined,
                    institution: institutionIdx !== -1 ? values[institutionIdx] : undefined,
                });
            }
            setCsvPreview(preview);
        } catch (error) {
            console.error("Error parsing CSV:", error);
            alert("Failed to parse CSV file");
            setSelectedFile(null);
            setCsvPreview([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            await usersApi.delete(id);
            // Refetch after delete
            const params = roleFilter === "all" ? undefined : {role: roleFilter};
            const response = await usersApi.list(params);
            setUsers((response.users || []) as UserWithCounts[]);
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleBulkImport = async () => {
        if (!selectedFile) return;

        setImporting(true);
        setImportResult(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const response = await usersApi.bulkImport(formData);
            setImportResult(response);

            // Refresh user list
            const params = roleFilter === "all" ? undefined : {role: roleFilter};
            const usersResponse = await usersApi.list(params);
            setUsers((usersResponse.users || []) as UserWithCounts[]);

            // Clear preview
            setCsvPreview([]);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

            alert("Import completed successfully!");
        } catch (error) {
            console.error("Bulk import error:", error);
            alert(error instanceof Error ? error.message : "Failed to import users");
        } finally {
            setImporting(false);
        }
    };

    const cancelImport = () => {
        setCsvPreview([]);
        setSelectedFile(null);
        setImportResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const downloadTemplate = () => {
        const csvContent =
            "name,email,password,role\nJohn Doe,john@example.com,password123,PESERTA\nJane Smith,jane@example.com,password123,FACILITATOR";
        const blob = new Blob([csvContent], {type: "text/csv"});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users-template.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-600 mt-1">Manage system users and their roles</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowBulkImport(!showBulkImport)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Import
                    </Button>
                    <Button onClick={() => router.push("/users/new")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Bulk Import Section */}
            {showBulkImport && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Bulk Import Users from CSV</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={downloadTemplate}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Template
                            </Button>
                            <div className="flex-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    disabled={importing}
                                    className="block w-full text-sm text-slate-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                            </div>
                        </div>

                        {/* CSV Preview */}
                        {csvPreview.length > 0 && (
                            <div className="border border-slate-200 rounded-md overflow-hidden">
                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-700">
                                        Preview: {csvPreview.length} rows (showing first 10)
                                    </p>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleBulkImport} disabled={importing}>
                                            <Check className="h-4 w-4 mr-2" />
                                            {importing ? "Importing..." : "Confirm Import"}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={cancelImport} disabled={importing}>
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium text-slate-700">Name</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-700">
                                                    Email
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-700">Role</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-700">
                                                    Institution
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {csvPreview.map((row, idx) => (
                                                <tr key={idx} className="border-t border-slate-200">
                                                    <td className="px-3 py-2 text-slate-900">{row.name}</td>
                                                    <td className="px-3 py-2 text-slate-600">{row.email}</td>
                                                    <td className="px-3 py-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {row.role || "PESERTA"}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-600">
                                                        {row.institution || "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {importing && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm">Importing users...</span>
                            </div>
                        )}

                        {importResult && (
                            <div className="bg-slate-50 p-4 rounded-md space-y-2">
                                <p className="font-semibold text-slate-900">{importResult.message}</p>
                                {importResult.results && (
                                    <div className="text-sm text-slate-600">
                                        <p>✓ Success: {importResult.results.success}</p>
                                        <p>✗ Failed: {importResult.results.failed}</p>
                                        {importResult.results.errors && importResult.results.errors.length > 0 && (
                                            <div className="mt-2">
                                                <p className="font-medium text-slate-700">Errors:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {importResult.results.errors
                                                    .slice(0, 5)
                                                    .map((err: string, idx: number) => (
                                                        <li key={idx} className="text-red-600">
                                                            {err}
                                                        </li>
                                                    ))}
                                                    {importResult.results.errors.length > 5 && (
                                                        <li className="text-slate-500">
                                                            ...and {importResult.results.errors.length - 5} more errors
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-md">
                            <p className="font-medium text-blue-900 mb-1">CSV Format Requirements:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Required columns: name, email, password</li>
                                <li>Optional columns: role (SUPER_ADMIN, FACILITATOR, PESERTA), institution</li>
                                <li>Default role if not specified: PESERTA</li>
                                <li>Duplicate emails will be skipped</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                <SelectItem value="FACILITATOR">Facilitator</SelectItem>
                                <SelectItem value="PESERTA">Peserta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-600 font-medium">No users found</p>
                        <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filter</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredUsers.map((user) => (
                        <Card key={user.id} className="hover:shadow-lg transition-all duration-200">
                            <CardContent className="py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-slate-900">{user.name}</h3>
                                                <Badge
                                                    variant={
                                                        getRoleBadgeColor(user.role) as
                                                            | "default"
                                                            | "secondary"
                                                            | "destructive"
                                                            | "outline"
                                                            | "success"
                                                    }
                                                    className="mt-1"
                                                >
                                                    {user.role.replace("_", " ")}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-slate-600 mt-3">
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="h-4 w-4" />
                                                <span>{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                            {user._count && (
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-4 w-4" />
                                                    <span>{user._count.submissions || 0} submissions</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => router.push(`/users/${user.id}`)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleDelete(user.id, user.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
