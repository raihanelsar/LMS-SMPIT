"use client";

import {useEffect} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {reflectionsApi} from "@/lib/api-client";

export default function ReflectionDeletePage() {
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const remove = async () => {
            try {
                await reflectionsApi.delete(params.id as string);
                router.replace("/reflections");
            } catch (error) {
                console.error("Delete reflection error:", error);
                router.replace("/reflections");
            }
        };

        remove();
    }, [params.id, router]);

    return (
        <Card>
            <CardContent className="py-16 text-center">
                <p className="text-slate-500 text-lg">Menghapus refleksi...</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/reflections")}>
                    Kembali
                </Button>
            </CardContent>
        </Card>
    );
}