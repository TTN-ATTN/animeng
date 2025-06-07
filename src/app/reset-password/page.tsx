'use client'

import ResetForm from "@/components/client/ResetForm";
import { useSearchParams } from 'next/navigation';
import { Suspense } from "react";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    if (!userId || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
                <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        404 - Page Not Found
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
            <ResetForm userId={userId} token={token} />
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
