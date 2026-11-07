import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../backend/config/db';

export const dynamic = 'force-dynamic';

/** Liveness/readiness probe for a load balancer or uptime monitor. */
export async function GET() {
    try {
        await connectDB();
        await mongoose.connection.db.admin().ping();
        return NextResponse.json({ status: 'ok', database: 'up' }, { status: 200 });
    } catch (error) {
        console.error('Health check failed:', error.message);
        return NextResponse.json({ status: 'error', database: 'down' }, { status: 503 });
    }
}
