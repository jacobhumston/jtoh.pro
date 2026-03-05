/**
 * Authentication module for the client.
 *
 * Authored by Jacob Humston
 */
import deepEqual from 'deep-equal';

import rybbit, { analyticsWrap } from '@client/modules/analytics';
import { client } from '@client/modules/api';
import { createPopupNotification } from '@client/modules/notifications';
import storage from '@client/modules/storage';
import type { AuthInfoSchema } from '@schemas/auth';

/**
 * Get the current auth state of the client.
 * @returns The current auth state of the client.
 */
export async function getAuth(): Promise<AuthInfoSchema | null> {
    const savedAuth = storage.getItem('auth');
    if (savedAuth && savedAuth.roblox) {
        /**
         * Check auth to make sure the client is still logged in.
         */
        async function check() {
            const response = await client.GET('/api/auth/me');
            if (!deepEqual(response.data, savedAuth)) {
                storage.removeItem('auth');
                analyticsWrap(() => {
                    rybbit.clearUserId();
                });
                createPopupNotification('Your session has expired, please login again.', () =>
                    document.location.reload()
                );
            }
        }
        check();
        analyticsWrap(() => {
            if (savedAuth.roblox) rybbit.identify(savedAuth.roblox.username, { robloxId: savedAuth.roblox.id });
        });
        return savedAuth;
    } else {
        const response = await client.GET('/api/auth/me');
        if (response.data) {
            storage.setItem('auth', response.data);
            analyticsWrap(() => {
                if (response.data.roblox) {
                    rybbit.identify(response.data.roblox.username, { robloxId: response.data.roblox.id });
                }
            });
        }
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
