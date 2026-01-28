/**
 * This script manages authentication.
 * It includes some built-in security features as well.
 *
 * Authored by Jacob Humston
 */
import { DatabaseClient } from '@server/managers/database';

/** Represents an authenticated Roblox user. */
export type AuthenticatedRobloxUser = {
    /** ID of this user. */
    id: number;
    /** Username of this user. */
    username: string;
    /** Display name of this user. */
    displayName: string;
};

// auth database
const database = new DatabaseClient<AuthenticatedRobloxUser>('auth', 'roblox');
