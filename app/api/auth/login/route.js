import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import User from '../../../../backend/models/User';
import argon2 from 'argon2';
import crypto from 'crypto';
import { readJson, isNonEmptyString, validationFailed, handleApiError } from '../../../../lib/api';
import { startSession } from '../../../../lib/session';
import { clientIp, rateLimited } from '../../../../lib/rateLimit';

const INVALID_CREDENTIALS = 'Email ou mot de passe incorrect';
const MAX_FAILED_ATTEMPTS = 10;
const LOCK_DURATION_MS = 15 * 60 * 1000;

// A real hash with the same cost as stored passwords. Verifying against it when the email is
// unknown takes as long as a real check, so response time doesn't reveal which emails exist.
let dummyHashPromise;
const getDummyHash = () => {
    dummyHashPromise ??= argon2.hash(crypto.randomBytes(32).toString('hex'), {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });
    return dummyHashPromise;
};

export async function POST(request) {
    const limited = rateLimited(NextResponse, 'login', clientIp(request));
    if (limited) return limited;

    try {
        await connectDB();
        const { email, password } = await readJson(request);

        if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
            return validationFailed(['Email et mot de passe requis']);
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            await argon2.verify(await getDummyHash(), password).catch(() => { });
            return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
        }

        if (user.lockedUntil && user.lockedUntil > Date.now()) {
            return NextResponse.json({ error: 'Compte temporairement verrouillé. Réessayez plus tard.' }, { status: 403 });
        }

        // A lock that has run out starts a fresh count, otherwise one typo would re-lock the account.
        const previousFailures = user.lockedUntil ? 0 : user.failedLoginAttempts;

        const isValidPassword = await argon2.verify(user.password, password);

        if (!isValidPassword) {
            const failures = previousFailures + 1;
            const update = failures >= MAX_FAILED_ATTEMPTS
                ? { $set: { failedLoginAttempts: failures, lockedUntil: new Date(Date.now() + LOCK_DURATION_MS) } }
                : { $set: { failedLoginAttempts: failures }, $unset: { lockedUntil: 1 } };
            await User.updateOne({ _id: user._id }, update);
            return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
        }

        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0 }, $unset: { lockedUntil: 1 } });
        }

        const response = NextResponse.json({
            message: 'Login successful',
            user: { id: user._id.toString(), email: user.email, name: user.name }
        }, { status: 200 });

        await startSession(response, user, request);
        return response;

    } catch (error) {
        return handleApiError(error, 'Login error');
    }
}
