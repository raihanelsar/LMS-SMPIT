"use client";

import {useState} from "react";
import {useAuth} from "@/lib/auth-context";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Loader2, User, Lock, Mail, Building} from "lucide-react";
import {usersApi} from "@/lib/api-client";
import type {User as UserType} from "@/types";

export default function SettingsPage() {
    const {user, updateUser} = useAuth();

    const [activeTab, setActiveTab] = useState("profile");

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        institution: user?.institution || "",
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState("");

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError("");
        setProfileLoading(true);

        try {
            const response = await usersApi.update(user?.id || "", profileData);
            const updatedUser = response.user as UserType;
            updateUser(updatedUser);
            alert("Profile updated successfully!");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
            setProfileError(errorMessage);
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");
        setPasswordLoading(true);

        // Validation
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match");
            setPasswordLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            setPasswordLoading(false);
            return;
        }

        try {
            await usersApi.update(user?.id || "", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            setPasswordSuccess("Password changed successfully!");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to change password";
            setPasswordError(errorMessage);
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Pengaturan</h1>
                <p className="text-slate-600 mt-1">Kelola pengaturan dan preferensi akun Anda</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profil
                    </TabsTrigger>
                    <TabsTrigger value="password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Profil</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">Perbarui informasi pribadi dan kontak Anda</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                {profileError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {profileError}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-slate-600" />
                                        Nama Lengkap
                                    </Label>
                                    <Input
                                        id="name"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                        placeholder="Masukkan nama lengkap Anda"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-slate-600" />
                                        Alamat Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        placeholder="Masukkan email Anda"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="institution" className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-slate-600" />
                                        Institusi
                                    </Label>
                                    <Input
                                        id="institution"
                                        value={profileData.institution}
                                        onChange={(e) => setProfileData({...profileData, institution: e.target.value})}
                                        placeholder="Masukkan institusi Anda"
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={profileLoading}>
                                        {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Password Tab */}
                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ubah Password</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">
                                Perbarui password untuk menjaga keamanan akun Anda
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                {passwordError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {passwordError}
                                    </div>
                                )}

                                {passwordSuccess && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                        {passwordSuccess}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                currentPassword: e.target.value,
                                            })
                                        }
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                newPassword: e.target.value,
                                            })
                                        }
                                        placeholder="Enter new password (min 6 characters)"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={passwordLoading}>
                                        {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Change Password
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
