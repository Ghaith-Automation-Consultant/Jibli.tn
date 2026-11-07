import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Trip from '../../../../backend/models/Trip';
import '../../../../backend/models/User'; // registers the model for populate()
import { getAuthenticatedUser } from '../../auth/helper';
import { handleApiError, isValidId, pick, readJson, validationFailed } from '../../../../lib/api';
import { validateTrip } from '../../../../lib/validation';

const UPDATE_FIELDS = ['from', 'to', 'departureDate', 'arrivalDate', 'maxWeight', 'size', 'priceType', 'price', 'status'];

const notFound = () => NextResponse.json({ error: 'Trip not found' }, { status: 404 });

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        if (!isValidId(id)) return notFound();

        // Public route: email and phone stay private.
        const trip = await Trip.findById(id).populate('user', 'name location avatar bio');
        if (!trip) return notFound();

        return NextResponse.json(trip, { status: 200 });
    } catch (error) {
        return handleApiError(error, 'Error fetching trip by id');
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

        const trip = await Trip.findById(id);
        if (!trip) return notFound();

        // Security check: only allow trip creator to edit
        if (trip.user.toString() !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = pick(await readJson(request), UPDATE_FIELDS);
        const errors = validateTrip(body, { partial: true });
        if (errors.length > 0) return validationFailed(errors);

        const updatedTrip = await Trip.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
        return NextResponse.json(updatedTrip, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error updating trip');
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

        const trip = await Trip.findById(id);
        if (!trip) return notFound();

        // Security check: only allow trip creator to delete
        if (trip.user.toString() !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await Trip.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Trip deleted' }, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error deleting trip');
    }
}
