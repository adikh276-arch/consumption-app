import React, { createContext, useContext, useEffect, useState } from "react";
import { bootstrapAuth } from "@/lib/bootstrapAuth";
import { setCurrentUser } from "@/lib/supabase";

interface AuthState {
    userId: number | null;
    loading: boolean;
    error?: string;
}

const AuthContext = createContext<AuthState>({ userId: null, loading: true });

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({ userId: null, loading: true });

    useEffect(() => {
        async function authenticate() {
            try {
                console.log("[AuthProvider] Starting auth...");
                const { userId } = await bootstrapAuth();
                console.log("[AuthProvider] Auth complete, userId:", userId);

                // Set Supabase context for RLS
                try {
                    await setCurrentUser(userId);
                    console.log("[AuthProvider] Supabase context set");
                } catch (error) {
                    console.warn("[AuthProvider] Failed to set Supabase context:", error);
                }

                setState({ userId, loading: false });
            } catch (error) {
                // bootstrapAuth handles redirects on error, this shouldn't execute
                const errMsg = error instanceof Error ? error.message : String(error);
                console.error("[AuthProvider] Unexpected auth error:", errMsg);
                setState({ userId: null, loading: false, error: errMsg });
            }
        }

        authenticate();
    }, []);

    if (state.loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <p className="text-muted-foreground font-medium">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="text-red-500 text-lg font-semibold">Auth Error</div>
                    <p className="text-muted-foreground">{state.error}</p>
                    <p className="text-xs text-muted-foreground">Check browser console for details</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
    );
}
