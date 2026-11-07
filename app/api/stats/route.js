import { NextResponse } from 'next/server';
import connectDB from '../../../backend/config/db';
import Trip from '../../../backend/models/Trip';
import Request from '../../../backend/models/Request';
import User from '../../../backend/models/User';

export async function GET() {
    try {
        await connectDB();
        const tripsCount = await Trip.countDocuments({});
        const requestsCount = await Request.countDocuments({});
        const usersCount = await User.countDocuments({});

        return NextResponse.json({
            trips: tripsCount,
            requests: requestsCount,
            users: usersCount
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
