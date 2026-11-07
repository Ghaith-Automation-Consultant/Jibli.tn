import { NextResponse } from 'next/server';

// A coarse first check for pages that need a session. The APIs verify the token itself. A
// missing cookie may just mean the 15-minute access token ran out: /login then tries the
// refresh token (which this file can't see, as its cookie is limited to /api/auth).
export function proxy(request) {
    if (!request.cookies.get('access_token')?.value) {
        const { pathname, search } = request.nextUrl;
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname + search);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // /profile/:id is a public page, so only the exact /profile (own settings) is protected.
    matcher: [
        '/dashboard/:path*',
        '/profile',
        '/messages/:path*',
        '/poster-annonce/:path*',
    ],
};
