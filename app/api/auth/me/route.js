import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import { getAuthenticatedUser } from '../helper';

export async function GET(request) {
    try {
        await connectDB();
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            message: 'Authentication successful',
            user: { id: user.id, email: user.email }
        }, { status: 200 });

    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
