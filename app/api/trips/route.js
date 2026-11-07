import { NextResponse } from 'next/server';
import connectDB from '../../../backend/config/db';
import Trip from '../../../backend/models/Trip';
import '../../../backend/models/User'; // registers the model for populate()
import { getAuthenticatedUser } from '../auth/helper';
import { containsFilter, handleApiError, isValidId, parsePagination, pick, readJson, validationFailed } from '../../../lib/api';
import { startOfToday, validateTrip } from '../../../lib/validation';

const CREATE_FIELDS = ['from', 'to', 'departureDate', 'arrivalDate', 'maxWeight', 'size', 'priceType', 'price'];

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const date = searchParams.get('date');
        const minWeight = Number(searchParams.get('minWeight') || NaN);
        const priceType = searchParams.get('priceType');
        const size = searchParams.get('size');
        const owner = searchParams.get('user');

        const filter = {};

        if (from) filter.from = containsFilter(from);
        if (to) filter.to = containsFilter(to);
        if (!isNaN(minWeight)) filter.maxWeight = { $gte: minWeight };
        if (priceType) filter.priceType = priceType;
        if (size) filter.size = size;

        if (date) {
            const searchDate = new Date(date);
            if (isNaN(searchDate.getTime())) return validationFailed(['Date de recherche invalide']);
            filter.departureDate = { $gte: searchDate };
        }

        if (owner) {
            // A user's own listing (dashboard) includes past and closed trips.
            if (!isValidId(owner)) return validationFailed(['Identifiant utilisateur invalide']);
            filter.user = owner;
        } else {
            filter.status = 'active';
            filter.departureDate ??= { $gte: startOfToday() };
        }

        const { page, limit, skip } = parsePagination(searchParams);

        const trips = await Trip.find(filter)
            .sort({ departureDate: 1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'name location avatar');

        const total = await Trip.countDocuments(filter);

        return NextResponse.json({
            data: trips,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        }, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error fetching trips');
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const user = getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await readJson(request);
        const errors = validateTrip(body);
        if (errors.length > 0) return validationFailed(errors);

        const createdTrip = await Trip.create({ ...pick(body, CREATE_FIELDS), user: user.id });
        return NextResponse.json(createdTrip, { status: 201 });

    } catch (error) {
        return handleApiError(error, 'Create trip error');
    }
}
