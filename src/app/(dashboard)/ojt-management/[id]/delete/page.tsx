"use client";

import {useEffect} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {ojtApi} from "@/lib/api-client";

export default function OjtDeletePage() {
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const remove = async () => {
            try {
                await ojtApi.delete(params.id as string);
                router.replace("/ojt-management");
            } catch (error) {
                console.error("Delete OJT error:", error);
                router.replace("/ojt-management");
            }
        };

        remove();
    }, [params.id, router]);

    return (
        <Card>
            <CardContent className="py-16 text-center">
                <p className="text-slate-500 text-lg">Menghapus laporan OJT...</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/ojt-management")}>
                    Kembali
                </Button>
            </CardContent>
        </Card>
    );
}