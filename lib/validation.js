import { isNonEmptyString } from './api';

// At least 12 characters with a lowercase, an uppercase, a digit and a special character.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{12,256}$/;

export const PASSWORD_RULE_MESSAGE =
    'Le mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.';

export const isStrongPassword = (password) => typeof password === 'string' && PASSWORD_REGEX.test(password);

const isValidDate = (value) => typeof value === 'string' && !isNaN(new Date(value).getTime());

const toNumber = (value) => (typeof value === 'number' || typeof value === 'string' ? parseFloat(value) : NaN);

export function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

/**
 * Validates trip fields. With `partial`, only the fields present are checked (PUT);
 * otherwise required fields must also be present (POST).
 */
export function validateTrip(body, { partial = false } = {}) {
    const errors = [];
    const has = (field) => body[field] !== undefined;

    if (has('from') ? !isNonEmptyString(body.from) : !partial) errors.push('Le lieu de départ est requis');
    if (has('to') ? !isNonEmptyString(body.to) : !partial) errors.push("Le lieu d'arrivée est requis");

    if (has('departureDate')) {
        if (!isValidDate(body.departureDate)) {
            errors.push('La date de départ est invalide');
        } else if (!partial && new Date(body.departureDate) < startOfToday()) {
            errors.push('La date de départ ne peut pas être dans le passé');
        }
    } else if (!partial) {
        errors.push('La date de départ est requise');
    }

    if (has('arrivalDate') && body.arrivalDate !== null && !isValidDate(body.arrivalDate)) {
        errors.push("La date d'arrivée est invalide");
    }

    if (has('maxWeight')) {
        if (!(toNumber(body.maxWeight) > 0)) errors.push('Le poids maximum doit être un nombre positif');
    } else if (!partial) {
        errors.push('Le poids maximum est requis');
    }

    if (has('price') && !(toNumber(body.price) >= 0)) errors.push('Le prix doit être un nombre positif ou nul');

    return errors;
}

export function validateRequest(body, { partial = false } = {}) {
    const errors = [];
    const has = (field) => body[field] !== undefined;

    if (has('item') ? !isNonEmptyString(body.item) : !partial) errors.push("Le nom de l'objet est requis");
    if (has('location') ? !isNonEmptyString(body.location) : !partial) errors.push('La destination est requise');
    if (has('description') && typeof body.description !== 'string') errors.push('La description est invalide');
    if (has('weight') && !(toNumber(body.weight) > 0)) errors.push('Le poids doit être un nombre positif');
    if (has('budget') && !(toNumber(body.budget) >= 0)) errors.push('Le budget doit être un nombre positif ou nul');

    return errors;
}
