/**
 * This script manages authentication.
 * It includes some built-in security features as well.
 *
 * Authored by Jacob Humston
 */
import { toDate } from '@jacobhumston/tc.js';
import type { Context } from 'hono';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';
import * as client from 'openid-client';

import { serverURL } from '@server/config';
import { DatabaseClient } from '@server/managers/database';
import { createTask } from '@server/managers/tasks';
import { getDefaultAvatarHeadshot } from '@server/modules/roblox';
import { generateRawToken, getSecret } from '@server/modules/secrets';
import apiTokens from '@server/modules/tokens';

/** Represents an authenticated Roblox user. */
export type AuthenticatedRobloxUser = {
    /** ID of this user. */
    id: number;
    /** Username of this user. */
    username: string;
    /** Display name of this user. */
    displayName: string;
    /** Profile picture of this user. */
    picture: string;
    /** The date this authenticated user expires. */
    expires: string;
};

const robloxAuthDatabase = new DatabaseClient<AuthenticatedRobloxUser>('auth', 'roblox');
const robloxAuthConfig = await client.discovery(
    new URL('https://apis.roblox.com/oauth/'),
    apiTokens.robloxAuthClientId,
    apiTokens.robloxAuthSecret
);

/**
 * Get the Roblox auth config.
 * @returns The Roblox auth config.
 */
export function getRobloxAuthConfig() {
    return {
        config: robloxAuthConfig,
        client: client
    };
}

/**
 * Authenticate a user who has successfully completed the OAuth flow for Roblox.
 * @param context The context for the request.
 * @param data The data provided from `v1/userinfo`.
 */
export async function authenticateRoblox(
    context: Context,
    data: { sub: string; name: string; preferred_username: string; picture: string }
) {
    const sessionToken = generateRawToken();
    const authCookieSecret = await getSecret('authCookieSecrete');
    const expires = toDate('future', { weeks: 2 });

    await robloxAuthDatabase.set(sessionToken, {
        id: parseInt(data.sub),
        displayName: data.name,
        username: data.preferred_username,
        picture: data.picture ?? getDefaultAvatarHeadshot(),
        expires: expires.toISOString()
    });

    await setSignedCookie(context, 'authentication', sessionToken, authCookieSecret, {
        domain: serverURL.host,
        expires: expires,
        httpOnly: true,
        sameSite: 'strict',
        secure: true
    });
}

/**
 * Get the authenticated user or null if they are not authenticated.
 * @param context The context of the request.
 * @returns The authenticated user or null if they are not authenticated.
 */
export async function getAuthenticatedRobloxUser(context: Context): Promise<AuthenticatedRobloxUser | null> {
    const authCookieSecret = await getSecret('authCookieSecrete');
    const sessionToken = await getSignedCookie(context, authCookieSecret, 'authentication');
    if (!sessionToken) return null;

    const user = await robloxAuthDatabase.get(sessionToken);
    return user ?? null;
}

// Sweeper for expired authentications.
createTask(`Authentication Sweeper`, 'Sweeps expired authentication every 1 hour.', { hours: 1 }, async function () {
    const result = await robloxAuthDatabase.all();
    for (const [key, value] of Object.entries(result)) {
        if (value.expires) {
            if (Date.now() > new Date(value.expires).getTime()) await robloxAuthDatabase.delete(key);
        }
    }
});
