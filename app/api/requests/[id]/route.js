import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Request from '../../../../backend/models/Request';
import '../../../../backend/models/User'; // registers the model for populate()
import { getAuthenticatedUser } from '../../auth/helper';
import { handleApiError, isValidId, pick, readJson, validationFailed } from '../../../../lib/api';
import { validateRequest } from '../../../../lib/validation';

const UPDATE_FIELDS = ['item', 'description', 'location', 'weight', 'budget', 'status'];

const notFound = () => NextResponse.json({ error: 'Request not found' }, { status: 404 });

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!isValidId(id)) return notFound();

        // Public route: email and phone stay private.
        const reqObj = await Request.findById(id).populate('user', 'name location avatar bio');
        if (!reqObj) return notFound();

        return NextResponse.json(reqObj, { status: 200 });
    } catch (error) {
        return handleApiError(error, 'Error fetching request by id');
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
        if (!isValidId(id)) return notFound();

        const reqObj = await Request.findById(id);
        if (!reqObj) return notFound();

        // Security check: only allow creator to edit
        if (reqObj.user.toString() !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = pick(await readJson(request), UPDATE_FIELDS);
        const errors = validateRequest(body, { partial: true });
        if (errors.length > 0) return validationFailed(errors);

        const updatedRequest = await Request.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
        return NextResponse.json(updatedRequest, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error updating request');
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (!isValidId(id)) return notFound();

        const reqObj = await Request.findById(id);
        if (!reqObj) return notFound();

        // Security check: only allow creator to delete
        if (reqObj.user.toString() !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await Request.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Request deleted' }, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error deleting request');
    }
}
