import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import User from '../../../../backend/models/User';
import argon2 from 'argon2';
import { readJson, isNonEmptyString, validationFailed, handleApiError } from '../../../../lib/api';
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from '../../../../lib/validation';
import { clientIp, rateLimited } from '../../../../lib/rateLimit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
    const limited = rateLimited(NextResponse, 'register', clientIp(request));
    if (limited) return limited;

    try {
        await connectDB();
        const { email, password, name } = await readJson(request);

        if (!isNonEmptyString(email) || !isNonEmptyString(password) || !isNonEmptyString(name)) {
            return validationFailed(['Tous les champs sont requis']);
        }
        if (!EMAIL_REGEX.test(email)) {
            return validationFailed(['Adresse email invalide']);
        }
        if (!isStrongPassword(password)) {
            return validationFailed([PASSWORD_RULE_MESSAGE]);
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json({ error: 'Cette adresse email est déjà utilisée' }, { status: 409 });
        }

        // Hash password with Argon2id
        const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536, // 64 MB
            timeCost: 3,
            parallelism: 4
        });

        await User.create({
            email: email.toLowerCase(),
            password: passwordHash,
            name: name.trim()
        });

        return NextResponse.json({ message: 'User registered successfully. Please login.' }, { status: 201 });

    } catch (error) {
        return handleApiError(error, 'Registration error');
    }
}
