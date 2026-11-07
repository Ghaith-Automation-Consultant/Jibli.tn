import { NextResponse } from 'next/server';
import connectDB from '../../../backend/config/db';
import Message from '../../../backend/models/Message';
import User from '../../../backend/models/User';
import { getAuthenticatedUser } from '../auth/helper';
import { readJson, isValidId, isNonEmptyString, validationFailed, handleApiError } from '../../../lib/api';
import { rateLimited } from '../../../lib/rateLimit';

export async function POST(request) {
    try {
        await connectDB();
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const limited = rateLimited(NextResponse, 'message', user.id);
        if (limited) return limited;

        const { receiverId, content } = await readJson(request);

        if (!isValidId(receiverId) || !isNonEmptyString(content)) {
            return validationFailed(['Le destinataire et le contenu du message sont requis']);
        }
        if (receiverId === user.id) {
            return validationFailed(['Vous ne pouvez pas vous envoyer un message à vous-même']);
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return NextResponse.json({ error: 'Utilisateur destinataire non trouvé' }, { status: 404 });
        }

        const message = await Message.create({
            sender: user.id,
            receiver: receiverId,
            content
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name')
            .populate('receiver', 'name');

        return NextResponse.json(populatedMessage, { status: 201 });

    } catch (error) {
        return handleApiError(error, 'Send message error');
    }
}
