import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import RefreshToken from '../../../../backend/models/RefreshToken';
import '../../../../backend/models/User'; // registers the model for populate()
import { handleApiError } from '../../../../lib/api';
import { hashToken, startSession, clearSessionCookies } from '../../../../lib/session';

export async function POST(request) {
    try {
        await connectDB();
        const rawRefreshToken = request.cookies.get('refresh_token')?.value;

        if (!rawRefreshToken) {
            return NextResponse.json({ error: 'Refresh token missing' }, { status: 401 });
        }

        const tokenRecord = await RefreshToken.findOne({ tokenHash: hashToken(rawRefreshToken) }).populate('userId');

        if (!tokenRecord || !tokenRecord.userId) {
            const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 403 });
            clearSessionCookies(response);
            return response;
        }

        const user = tokenRecord.userId;

        if (tokenRecord.isRevoked) {
            console.warn(`Token theft detected for user ${user._id}`);
            // Revoke all sessions for this user for security
            await RefreshToken.updateMany({ userId: user._id }, { $set: { isRevoked: true } });
            return NextResponse.json({ error: 'Token revoked. All sessions terminated.' }, { status: 403 });
        }

        if (tokenRecord.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Refresh token expired' }, { status: 403 });
        }

        // Rotation: each refresh token works once.
        await RefreshToken.deleteOne({ _id: tokenRecord._id });

        const response = NextResponse.json({ message: 'Token refreshed successfully' }, { status: 200 });
        await startSession(response, user, request);
        return response;

    } catch (error) {
        return handleApiError(error, 'Refresh token error');
    }
}
