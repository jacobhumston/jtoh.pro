/**
 * Authentication module for the client.
 *
 * Authored by Jacob Humston
 */
import deepEqual from 'deep-equal';

import { client } from '@client/modules/api';
import storage from '@client/modules/storage';
import type { AuthInfoSchema } from '@shared/schemas/auth';

/**
 * Get the current auth state of the client.
 * @returns The current auth state of the client.
 */
export async function getAuth(): Promise<AuthInfoSchema | null> {
    const savedAuth = storage.getItem('auth');
    if (savedAuth && savedAuth.roblox) {
        // call anyways to make sure the auth state is update to date
        new Promise(async () => {
            const response = await client.GET('/api/auth/me');
            if (!deepEqual(response.data, savedAuth)) {
                storage.removeItem('auth');
                window.location.reload();
            }
        });
        return savedAuth;
    } else {
        const response = await client.GET('/api/auth/me');
        if (response.data) storage.setItem('auth', response.data);
        return response.data ?? null;
    }
}

/**
 * Get Roblox Auth information.
 * @returns Roblox auth information, or null if the user isn't authenticated.
 */
export async function getRobloxAuthInfo(): Promise<AuthInfoSchema['roblox']> {
    const auth = await getAuth();
    if (auth) return auth.roblox;
    else return null;
}
