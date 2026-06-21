"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useAuth} from "@/lib/auth-context";
import {ROLE_LABELS} from "@/lib/constants";
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    Briefcase,
    MessageSquare,
    FileBarChart,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    GraduationCap,
    ChevronDown,
    User,
    Bell,
} from "lucide-react";

const navigation = [
    {name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "FACILITATOR", "PESERTA"]},
    {name: "Programs", href: "/programs", icon: BookOpen, roles: ["SUPER_ADMIN", "FACILITATOR", "PESERTA"]},
    {name: "Assignments", href: "/assignments", icon: ClipboardList, roles: ["SUPER_ADMIN", "FACILITATOR", "PESERTA"]},
    {
        name: "OJT Management",
        href: "/ojt-management",
        icon: Briefcase,
        roles: ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    },
    {name: "Reflections", href: "/reflections", icon: MessageSquare, roles: ["SUPER_ADMIN", "FACILITATOR", "PESERTA"]},
    {name: "Reports", href: "/reports", icon: FileBarChart, roles: ["SUPER_ADMIN", "FACILITATOR"]},
    {name: "Users", href: "/users", icon: Users, roles: ["SUPER_ADMIN"]},
    {name: "Settings", href: "/settings", icon: Settings, roles: ["SUPER_ADMIN", "FACILITATOR", "PESERTA"]},
];

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    const {user, loading, logout} = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Jika auth sudah selesai di-check tapi user masih null,
    // paksa redirect ke login (middleware juga akan redirect).
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        await logout();
    };

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-full shadow-2xl">
                            <GraduationCap className="h-12 w-12 text-white animate-spin" />
                        </div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    const filteredNav = navigation.filter((item) => item.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 lg:translate-x-0 border-r border-slate-200",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl shadow-lg">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">LMS Seribu Bulan</h1>
                            <p className="text-xs text-blue-100">Digital Learning Platform</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-18rem)]">
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                                        : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-5 w-5",
                                        isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"
                                    )}
                                />
                                <span className="flex-1">{item.name}</span>
                                {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
                    <div className="mb-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <span
                                className={cn(
                                    "inline-block px-2.5 py-1 text-xs font-semibold rounded-full",
                                    user.role === "SUPER_ADMIN" &&
                                        "bg-purple-100 text-purple-700 border border-purple-200",
                                    user.role === "FACILITATOR" && "bg-blue-100 text-blue-700 border border-blue-200",
                                    user.role === "PESERTA" && "bg-green-100 text-green-700 border border-green-200"
                                )}
                            >
                                {ROLE_LABELS[user.role] || user.role}
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full border-slate-300 hover:bg-slate-100 hover:border-slate-400"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Keluar
                    </Button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm lg:px-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden hover:bg-slate-100"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex-1" />

                    {/* Right side actions */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
                            <Bell className="h-5 w-5 text-slate-600" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Button>

                        {/* User Menu */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 hover:bg-slate-100"
                            >
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </Button>

                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                        <Link
                                            href="/settings"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                        >
                                            <User className="h-4 w-4 text-slate-500" />
                                            Profile Settings
                                        </Link>
                                        <div className="border-t border-slate-200 my-1"></div>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Keluar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
