import { NextResponse } from 'next/server';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const isValidId = (id) => typeof id === 'string' && OBJECT_ID_REGEX.test(id);

export const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

/** Case-insensitive "contains" filter that treats user input literally, never as a regex. */
export const containsFilter = (value) => ({
    $regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    $options: 'i',
});

/** Reads page/limit from a query string, falling back on bad values and capping the page size. */
export function parsePagination(searchParams, { defaultLimit = 20, maxLimit = 100 } = {}) {
    const page = parseInt(searchParams.get('page'), 10);
    const limit = parseInt(searchParams.get('limit'), 10);
    const pageNum = page > 0 ? page : 1;
    const limitNum = limit > 0 ? Math.min(limit, maxLimit) : defaultLimit;
    return { page: pageNum, limit: limitNum, skip: (pageNum - 1) * limitNum };
}

/** Parses a JSON body, returning {} for anything that is not a JSON object. */
export async function readJson(request) {
    const body = await request.json().catch(() => null);
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {};
}

/** Copies only the listed fields, so a request body can't set anything else (e.g. the owner). */
export function pick(source, fields) {
    const result = {};
    for (const field of fields) {
        if (source[field] !== undefined) result[field] = source[field];
    }
    return result;
}

export const validationFailed = (details) =>
    NextResponse.json({ error: 'Données invalides', details }, { status: 400 });

/** Maps Mongoose/driver errors caused by bad input to 4xx; everything else is a logged 500. */
export function handleApiError(error, label) {
    if (error?.name === 'ValidationError') {
        return validationFailed(Object.values(error.errors).map((e) => e.message));
    }
    if (error?.name === 'CastError') {
        return validationFailed([`Valeur invalide pour le champ ${error.path}`]);
    }
    if (error?.code === 11000) {
        return NextResponse.json({ error: 'Cette valeur est déjà utilisée' }, { status: 409 });
    }
    console.error(`${label}:`, error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
}
