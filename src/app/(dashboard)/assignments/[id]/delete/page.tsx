"use client";

import {useEffect} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {assignmentsApi} from "@/lib/api-client";

export default function AssignmentDeletePage() {
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const remove = async () => {
            try {
                await assignmentsApi.delete(params.id as string);
                router.replace("/assignments");
            } catch (error) {
                console.error("Delete assignment error:", error);
                router.replace("/assignments");
            }
        };

        remove();
    }, [params.id, router]);

    return (
        <Card>
            <CardContent className="py-16 text-center">
                <p className="text-slate-500 text-lg">Menghapus tugas...</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/assignments")}>
                    Kembali
                </Button>
            </CardContent>
        </Card>
    );
}