import React, { createContext, useContext, useEffect, useState } from "react";
import { upsertUser } from "@/lib/supabase";

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
      // 1. Check sessionStorage for existing session
      const stored = sessionStorage.getItem("eap_user_id");
      if (stored) {
        setState({ userId: Number(stored), loading: false });
        return;
      }

      // 2. Check URL for token
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        window.location.href = "/token";
        return;
      }

      // 3. Validate token with API
      try {
        const res = await fetch("https://api.mantracare.com/user/user-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) throw new Error("Auth failed");

        const data = await res.json();
        const userId = Number(data.user_id);

        sessionStorage.setItem("eap_user_id", String(userId));

        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.pathname + url.search);

        // Upsert user in Supabase
        try {
          await upsertUser(userId);
        } catch (e) {
          console.warn("User upsert failed:", e);
        }

        setState({ userId, loading: false });
      } catch {
        window.location.href = "/token";
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
