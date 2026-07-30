import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-brand/5 via-background to-brand-accent/5 p-4">
            <div className="w-full max-w-md p-6">
                {children}
            </div>
        </div>
    );
}
