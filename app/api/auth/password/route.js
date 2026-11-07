import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import connectDB from '../../../../backend/config/db';
import User from '../../../../backend/models/User';
import RefreshToken from '../../../../backend/models/RefreshToken';
import { getAuthenticatedUser } from '../helper';
import { readJson, isNonEmptyString, validationFailed, handleApiError } from '../../../../lib/api';
import { hashToken } from '../../../../lib/session';
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from '../../../../lib/validation';
import { rateLimited } from '../../../../lib/rateLimit';

export async function PUT(request) {
    try {
        await connectDB();
        const authUser = getAuthenticatedUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Someone holding a stolen session could otherwise brute-force the old password here.
        const limited = rateLimited(NextResponse, 'password', authUser.id);
        if (limited) return limited;

        const { oldPassword, newPassword } = await readJson(request);

        if (!isNonEmptyString(oldPassword) || !isNonEmptyString(newPassword)) {
            return validationFailed(["L'ancien et le nouveau mot de passe sont requis"]);
        }
        if (!isStrongPassword(newPassword)) {
            return validationFailed([PASSWORD_RULE_MESSAGE]);
        }

        const user = await User.findById(authUser.id);
        if (!user) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        // 400, not 401: the session is fine, so the client must not try to refresh it.
        if (!(await argon2.verify(user.password, oldPassword))) {
            return validationFailed(["L'ancien mot de passe est incorrect"]);
        }

        user.password = await argon2.hash(newPassword, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4
        });
        await user.save();

        // Sign out every other device, in case the old password was compromised.
        const currentToken = request.cookies.get('refresh_token')?.value;
        await RefreshToken.deleteMany({
            userId: user._id,
            ...(currentToken ? { tokenHash: { $ne: hashToken(currentToken) } } : {})
        });

        return NextResponse.json({ message: 'Mot de passe modifié avec succès' }, { status: 200 });

    } catch (error) {
        return handleApiError(error, 'Change password error');
    }
}
