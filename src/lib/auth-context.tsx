"use client";

import {createContext, useContext, useEffect, useState, useCallback} from "react";
import {useRouter} from "next/navigation";
import {authApi} from "./api-client";
import type {User} from "@/types";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    updateUser: (user: User) => void;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        authApi
        .session()
        .then((response) => {
            if (response.authenticated) {
                setUser(response.user);
            }
        })
        .catch((error) => {
            console.error("Session check failed:", error);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    const updateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
    }, []);

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return <AuthContext.Provider value={{user, loading, updateUser, logout}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
