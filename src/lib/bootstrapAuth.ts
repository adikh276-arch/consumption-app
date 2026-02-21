/**
 * Production auth handshake for EAP trackers
 * CRITICAL: Blocks all UI rendering until auth completes
 */

interface BootstrapAuthResult {
    userId: number;
}

export async function bootstrapAuth(): Promise<BootstrapAuthResult> {
    // 1. Check sessionStorage for existing session
    const stored = sessionStorage.getItem("eap_user_id");
    if (stored) {
        console.log("[Auth] Found existing session, userId:", stored);
        return { userId: Number(stored) };
    }

    // 2. Check URL for token parameter
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    console.log("[Auth] Current URL:", window.location.href);
    console.log("[Auth] Token parameter:", token ? "present" : "MISSING");

    if (!token) {
        // No token found - hard redirect to /token page
        console.error("[Auth] No token in URL - redirecting to /token");
        window.location.href = "/token";
        // Keep throwing for TypeScript
        throw new Error("No token provided - redirecting to /token");
    }

    console.log("[Auth] Token found, validating with API...");

    // 3. POST token to API to validate and get user_id
    try {
        const apiUrl = "https://api.mantracare.com/user/user-info";
        console.log("[Auth] Calling:", apiUrl);
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });

        console.log("[Auth] API response status:", response.status);

        // 4. Check for success
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API returned ${response.status}: ${text}`);
        }

        const data = await response.json();
        console.log("[Auth] API response data:", data);
        
        const userId = Number(data.user_id);

        if (!userId || isNaN(userId)) {
            throw new Error("Invalid user_id in response: " + JSON.stringify(data));
        }

        console.log("[Auth] Success: user_id", userId);

        // 5. Store user_id in sessionStorage
        sessionStorage.setItem("eap_user_id", String(userId));

        // 6. Remove token from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.pathname + url.search);

        return { userId };
    } catch (error) {
        // ANY error redirects to /token
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[Auth] Bootstrap failed:", msg);
        window.location.href = "/token";
        throw error;
    }
}
