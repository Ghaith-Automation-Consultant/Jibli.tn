import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Message from '../../../../backend/models/Message';
import mongoose from 'mongoose';
import { getAuthenticatedUser } from '../../auth/helper';
import { handleApiError } from '../../../../lib/api';

export async function GET(request) {
    try {
        await connectDB();
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = new mongoose.Types.ObjectId(user.id);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", userId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'partner'
                }
            },
            {
                $unwind: '$partner'
            },
            {
                // Allow-list: the partner's document also holds email, phone and login state.
                $project: {
                    lastMessage: 1,
                    'partner._id': 1,
                    'partner.name': 1,
                    'partner.avatar': 1,
                    'partner.location': 1
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        return NextResponse.json(conversations, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error fetching conversations');
    }
}
