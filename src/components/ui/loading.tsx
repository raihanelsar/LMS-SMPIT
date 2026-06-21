import {Loader2} from "lucide-react";
import {cn} from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LoadingSpinner({size = "md", className}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };

    return (
        <div className="relative">
            <Loader2 className={cn("animate-spin text-indigo-600", sizeClasses[size], className)} />
            <Loader2
                className={cn("absolute inset-0 animate-ping text-indigo-600 opacity-20", sizeClasses[size], className)}
            />
        </div>
    );
}

export function LoadingPage({text = "Memuat..."}: {text?: string}) {
    return (
        <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-slate-600 animate-pulse font-medium">{text}</p>
            </div>
        </div>
    );
}

export function LoadingSkeleton({lines = 3, className = ""}: {lines?: number; className?: string}) {
    const widths = ["85%", "70%", "90%", "75%", "80%", "65%", "95%", "88%"];
    return (
        <div className={cn("space-y-3", className)}>
            {Array.from({length: lines}).map((_, i) => (
                <div key={i} className="skeleton h-4 rounded-md" style={{width: widths[i % widths.length]}} />
            ))}
        </div>
    );
}

export function LoadingCard() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="skeleton h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                </div>
            </div>
            <LoadingSkeleton lines={4} />
        </div>
    );
}

export function LoadingTable({rows = 5}: {rows?: number}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
                <div className="flex gap-4">
                    <div className="skeleton h-10 flex-1 rounded-lg" />
                    <div className="skeleton h-10 w-32 rounded-lg" />
                </div>
            </div>
            <div className="divide-y divide-slate-200">
                {Array.from({length: rows}).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                        <div className="skeleton h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 rounded w-3/4" />
                            <div className="skeleton h-3 rounded w-1/2" />
                        </div>
                        <div className="skeleton h-8 w-20 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}
