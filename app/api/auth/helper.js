import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../../../lib/session';

/**
 * Extracts and verifies the access token from request cookies.
 * Returns the decoded user payload or null if unauthorized.
 */
export function getAuthenticatedUser(request) {
    const token = request.cookies.get('access_token')?.value;
    if (!token) return null;

    try {
        return jwt.verify(token, getJwtSecret()); // { id, email }
    } catch (error) {
        // Expiry is routine: the client refreshes on the resulting 401.
        if (error.name !== 'TokenExpiredError') {
            console.error('JWT verify error in helper:', error.message);
        }
        return null;
    }
}
