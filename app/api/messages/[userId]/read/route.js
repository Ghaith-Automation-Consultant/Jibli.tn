import { NextResponse } from 'next/server';
import connectDB from '../../../../../backend/config/db';
import Message from '../../../../../backend/models/Message';
import { getAuthenticatedUser } from '../../../auth/helper';
import { isValidId, validationFailed, handleApiError } from '../../../../../lib/api';

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params; // The other user ID
        if (!isValidId(userId)) {
            return validationFailed(['Identifiant utilisateur invalide']);
        }

        await Message.updateMany(
            { sender: userId, receiver: user.id, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error marking messages as read');
    }
}
