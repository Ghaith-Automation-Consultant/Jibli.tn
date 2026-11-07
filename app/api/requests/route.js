import { NextResponse } from 'next/server';
import connectDB from '../../../backend/config/db';
import Request from '../../../backend/models/Request';
import '../../../backend/models/User'; // registers the model for populate()
import { getAuthenticatedUser } from '../auth/helper';
import { containsFilter, handleApiError, isValidId, parsePagination, pick, readJson, validationFailed } from '../../../lib/api';
import { validateRequest } from '../../../lib/validation';

const CREATE_FIELDS = ['item', 'description', 'location', 'weight', 'budget'];

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const location = searchParams.get('location');
        const maxBudget = Number(searchParams.get('maxBudget') || NaN);
        const owner = searchParams.get('user');

        const filter = {};

        if (query) {
            filter.$or = [
                { item: containsFilter(query) },
                { description: containsFilter(query) }
            ];
        }
        if (location) filter.location = containsFilter(location);
        if (!isNaN(maxBudget)) filter.budget = { $lte: maxBudget };

        if (owner) {
            // A user's own listing (dashboard) includes every status.
            if (!isValidId(owner)) return validationFailed(['Identifiant utilisateur invalide']);
            filter.user = owner;
        } else {
            filter.status = 'pending';
        }

        const { page, limit, skip } = parsePagination(searchParams);

        const requests = await Request.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'name location avatar');

        const total = await Request.countDocuments(filter);

        return NextResponse.json({
            data: requests,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        }, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Error fetching requests');
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
        const errors = validateRequest(body);
        if (errors.length > 0) return validationFailed(errors);

        const createdRequest = await Request.create({ ...pick(body, CREATE_FIELDS), user: user.id });
        return NextResponse.json(createdRequest, { status: 201 });

    } catch (error) {
        return handleApiError(error, 'Create request error');
    }
}
