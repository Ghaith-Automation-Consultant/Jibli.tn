import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import User from '../../../../backend/models/User';
import { getAuthenticatedUser } from '../../auth/helper';
import { handleApiError, isNonEmptyString, isValidId, pick, readJson, validationFailed } from '../../../../lib/api';

const PUBLIC_FIELDS = 'name location avatar bio languages reviews createdAt isEmailVerified isPhoneVerified isIdentityVerified';
const OWNER_FIELDS = `${PUBLIC_FIELDS} email phone`;
const EDITABLE_FIELDS = ['name', 'location', 'bio', 'phone', 'languages', 'avatar'];

const notFound = () => NextResponse.json({ error: 'User not found' }, { status: 404 });

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!isValidId(id)) return notFound();

        // Anyone can view a profile, but email and phone are only returned to their owner.
        const isOwner = getAuthenticatedUser(request)?.id === id;
        const targetUser = await User.findById(id).select(isOwner ? OWNER_FIELDS : PUBLIC_FIELDS);
        if (!targetUser) return notFound();

        return NextResponse.json(targetUser, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error fetching user by id');
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = pick(await readJson(request), EDITABLE_FIELDS);
        if (body.name !== undefined && !isNonEmptyString(body.name)) {
            return validationFailed(['Le nom est requis']);
        }

        const updatedUser = await User.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })
            .select(OWNER_FIELDS);
        if (!updatedUser) return notFound();

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error updating user');
    }
}
