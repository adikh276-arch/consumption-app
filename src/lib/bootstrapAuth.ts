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
    return { userId: Number(stored) };
  }

  // 2. Check URL for token parameter
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    // No token found - hard redirect to /token
    window.location.href = "/token";
    // This never returns, but TypeScript needs a throw
    throw new Error("No token provided - redirecting to /token");
  }

  // 3. POST token to API to validate and get user_id
  try {
    const response = await fetch("https://api.mantracare.com/user/user-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    // 4. Check for success
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const userId = Number(data.user_id);

    if (!userId || isNaN(userId)) {
      throw new Error("Invalid user_id in response");
    }

    // 5. Store user_id in sessionStorage
    sessionStorage.setItem("eap_user_id", String(userId));

    // 6. Remove token from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.pathname + url.search);

    return { userId };
  } catch (error) {
    // ANY error redirects to /token
    console.error("Auth bootstrap failed:", error);
    window.location.href = "/token";
    throw error;
  }
}
