// Browser-side fetch wrapper. Access tokens only last 15 minutes, so on a 401 it renews the
// session with the refresh token and retries once. If that fails, the session is over.

let refreshInFlight = null;

// Shared promise: refresh tokens rotate on use, so two parallel refreshes would invalidate each other.
export function refreshSession() {
    if (!refreshInFlight) {
        refreshInFlight = fetch('/api/auth/refresh', { method: 'POST' })
            .then((res) => res.ok)
            .catch(() => false)
            .finally(() => {
                refreshInFlight = null;
            });
    }
    return refreshInFlight;
}

export function clearLocalSession() {
    localStorage.removeItem('jibli_logged_in');
    localStorage.removeItem('jibli_user_name');
    window.dispatchEvent(new Event('jibli-auth-change'));
}

export async function apiFetch(url, options) {
    const res = await fetch(url, options);
    if (res.status !== 401) return res;

    if (await refreshSession()) return fetch(url, options);

    clearLocalSession();
    const here = window.location.pathname + window.location.search;
    window.location.href = `/login?redirect=${encodeURIComponent(here)}`;
    return res;
}

/** Only allow redirects within this site; `//evil.com` and `/\evil.com` leave the origin. */
export function safeRedirectPath(path, fallback = '/dashboard') {
    return typeof path === 'string' && /^\/(?![/\\])/.test(path) ? path : fallback;
}
