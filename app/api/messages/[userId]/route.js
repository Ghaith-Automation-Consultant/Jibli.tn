import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Message from '../../../../backend/models/Message';
import '../../../../backend/models/User'; // registers the model for populate()
import { getAuthenticatedUser } from '../../auth/helper';
import { isValidId, validationFailed, handleApiError } from '../../../../lib/api';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;
        if (!isValidId(userId)) {
            return validationFailed(['Identifiant utilisateur invalide']);
        }

        const messages = await Message.find({
            $or: [
                { sender: user.id, receiver: userId },
                { sender: userId, receiver: user.id }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name')
            .populate('receiver', 'name');

        return NextResponse.json(messages, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error fetching messages thread');
    }
}
