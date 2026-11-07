import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../backend/models/RefreshToken';

const ACCESS_TOKEN_SECONDS = 15 * 60;
const REFRESH_TOKEN_SECONDS = 30 * 24 * 60 * 60;

// The refresh cookie must also reach /api/auth/logout and /api/auth/password, so that
// they can revoke the session; a narrower path means those routes never see it.
const REFRESH_COOKIE_PATH = '/api/auth';
const OLD_REFRESH_COOKIE_PATH = '/api/auth/refresh';

const baseCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
});

// Values that have been published in this repository and so must never sign real tokens.
const PUBLIC_SECRETS = new Set(['change-me', 'jibli-secret-key-change-this']);

export function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (process.env.NODE_ENV === 'production' && (!secret || PUBLIC_SECRETS.has(secret) || secret.length < 32)) {
        throw new Error('JWT_SECRET must be set to a private random value of at least 32 characters in production');
    }
    return secret || 'jibli-tn-dev-only-secret';
}

export const hashToken = (rawToken) => crypto.createHash('sha256').update(rawToken).digest('hex');

// Browsers that logged in before the path change still hold a cookie on the old path. It
// would be sent first to /api/auth/refresh and shadow the current one, so expire it.
const expireOldRefreshCookie = (response) => {
    response.headers.append(
        'Set-Cookie',
        `refresh_token=; Path=${OLD_REFRESH_COOKIE_PATH}; Max-Age=0; HttpOnly; SameSite=Strict`
    );
};

/** Issues a new access/refresh token pair and sets both cookies on the response. */
export async function startSession(response, user, request) {
    const accessToken = jwt.sign({ id: user._id, email: user.email }, getJwtSecret(), {
        expiresIn: ACCESS_TOKEN_SECONDS,
    });

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    await RefreshToken.create({
        userId: user._id,
        tokenHash: hashToken(rawRefreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000),
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || '',
    });

    response.cookies.set('access_token', accessToken, {
        ...baseCookieOptions(),
        maxAge: ACCESS_TOKEN_SECONDS,
    });
    response.cookies.set('refresh_token', rawRefreshToken, {
        ...baseCookieOptions(),
        path: REFRESH_COOKIE_PATH,
        maxAge: REFRESH_TOKEN_SECONDS,
    });
    expireOldRefreshCookie(response);
}

export function clearSessionCookies(response) {
    response.cookies.set('access_token', '', { ...baseCookieOptions(), maxAge: 0 });
    response.cookies.set('refresh_token', '', {
        ...baseCookieOptions(),
        path: REFRESH_COOKIE_PATH,
        maxAge: 0,
    });
    expireOldRefreshCookie(response);
}
