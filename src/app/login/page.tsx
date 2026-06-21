"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {GraduationCap, Mail, Lock, Loader2, AlertCircle} from "lucide-react";
import {authApi} from "@/lib/api-client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const router = useRouter();

    // Cek session sekali saat mount — jika sudah login, langsung redirect
    useEffect(() => {
        authApi
        .session()
        .then((res) => {
            if (res.authenticated) {
                router.replace("/dashboard");
            } else {
                setReady(true);
            }
        })
        .catch(() => setReady(true));
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await authApi.login(email, password);
            // Cookie sudah di-set oleh API. Paksa reload agar AuthProvider
            // langsung mengambil session baru dan dashboard tidak glitch.
            window.location.href = "/dashboard";
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Login gagal";
            setError(message);
            setLoading(false);
        }
    };

    // Tampilkan skeleton tipis saat menunggu hasil cek session awal
    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white">
                <CardHeader className="space-y-3 pb-8 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                            <GraduationCap className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">LMS Seribu Bulan</CardTitle>
                    <CardDescription className="text-slate-500">
                        Platform Pembelajaran Digital SMPIT Seribu Bulan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@seribubulan.sch.id"
                                    required
                                    className="pl-11 h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                    className="pl-11 h-11"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Masuk"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <p className="text-xs text-center text-slate-500">
                            SMPIT Seribu Bulan Boarding School
                            <br />
                            Digitalisasi Pembelajaran
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
