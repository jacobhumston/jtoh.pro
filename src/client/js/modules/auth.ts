/**
 * Authentication module for the client.
 *
 * Authored by Jacob Humston
 */
//import cache from '@client/modules/cache';
import { client } from '@client/modules/api';
import type { AuthInfoSchema } from '@shared/schemas/auth';

/**
 * Get Roblox Auth information.
 * @returns Roblox auth information, or null if the user isn't authenticated.
 */
export async function getRobloxAuthInfo(): Promise<AuthInfoSchema['roblox'] | null> {
    const response = await client.GET('/api/auth/me');
    if (response.data) return response.data.roblox;
    else return null;
}
