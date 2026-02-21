import React, { createContext, useContext, useEffect, useState } from "react";
import { bootstrapAuth } from "@/lib/bootstrapAuth";
import { setCurrentUser } from "@/lib/supabase";

interface AuthState {
  userId: number | null;
  loading: boolean;
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
        const { userId } = await bootstrapAuth();

        // Set Supabase context for RLS
        try {
          await setCurrentUser(userId);
        } catch (error) {
          console.warn("Failed to set Supabase context:", error);
        }

        setState({ userId, loading: false });
      } catch (error) {
        // bootstrapAuth handles redirects on error, this shouldn't execute
        console.error("Unexpected auth error:", error);
        setState({ userId: null, loading: false });
      }
    }

    authenticate();
  }, []);

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
  );
}
