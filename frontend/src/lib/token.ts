/**
 * Decode the `exp` claim of a JWT and return it as epoch milliseconds.
 * Returns null if the token is missing/malformed or has no numeric `exp`.
 * Does NOT verify the signature — it only reads the (public) expiry so the
 * client can pre-emptively log the user out the moment the token lapses.
 */
export function getTokenExpiryMs(token: string | null | undefined): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob !== "undefined"
        ? atob(b64)
        : Buffer.from(b64, "base64").toString("binary");
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** True if the token is absent or its expiry is in the past. */
export function isTokenExpired(token: string | null | undefined): boolean {
  const exp = getTokenExpiryMs(token);
  if (exp == null) return false; // unknown expiry — let the server decide via 401
  return exp <= Date.now();
}
