import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import RefreshToken from '../../../../backend/models/RefreshToken';
import { hashToken, clearSessionCookies } from '../../../../lib/session';

export async function POST(request) {
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    // Clear the browser's cookies even if the database is unreachable.
    clearSessionCookies(response);

    try {
        const rawRefreshToken = request.cookies.get('refresh_token')?.value;
        if (rawRefreshToken) {
            await connectDB();
            await RefreshToken.deleteOne({ tokenHash: hashToken(rawRefreshToken) });
        }
    } catch (error) {
        console.error('Logout error:', error);
    }

    return response;
}
