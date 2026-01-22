/**
 * This file handle's user permissions.
 * Users are linked Roblox accounts, and as such
 * permissions are linked to a Roblox ID.
 *
 * Authored by Jacob Humston
 */
import { createMiddleware } from 'hono/factory';

import { DatabaseClient } from '@server/managers/database';
import apiTokens from '@server/modules/tokens';

// The admin ID is stored as a token, because that's practical I suppose.
const database = new DatabaseClient<{ read: Array<PermissionTypes>; write: Array<PermissionTypes> }>(
    'permissions',
    'users'
);
const adminId = apiTokens.robloxAdminUserId; // LovelyJacob

/** Permissions table. */
export const permissions = [
    { name: 'User Moderation', description: 'Access to user moderation features.' },
    { name: 'Server Logs', description: 'Access to server logs.' },
    { name: 'Private API Documentation', description: 'Access to private API documentation.' },
    { name: 'Permissions Table', description: 'Access the permissions table.' },
    { name: 'Merch Orders', description: 'Access to merch orders.' },
    { name: 'Task Management', description: 'Access to server task management.' },
    { name: 'Support Portal', description: 'Access to the support portal.' }
] as const;

/** Structure of a permission. */
export type PermissionObject = {
    /** Name of this permission. */
    name: string;
    /** Description of this permission. */
    description: string;
};

/** Available permission types. */
export type PermissionTypes = (typeof permissions)[number]['name'];

/** Available permission action types. */
export type PermissionActionTypes = 'read' | 'write';

/** Available permission types. */
export const permissionTypes: Array<PermissionTypes> = permissions.map((perm) => perm.name);

/** Available permission action types. */
export const permissionActionTypes: Array<PermissionActionTypes> = ['read', 'write'];

/**
 * Returns true if the userid is the admin. (aka LovelyJacob)
 * @param userId The userid to compare.
 * @returns A boolean indicating if the userid is the admin.
 */
export function isAdmin(userId: number): boolean {
    return userId === adminId;
}

/**
 * Check if a user has a permission.
 * @param userId The user to check.
 * @param permission The permission to check for.
 * @param action The action related to this permission.
 * @returns A boolean indicating whether this user has that permission or not.
 */
export async function hasPermission(
    userId: number,
    permission: PermissionTypes,
    action: PermissionActionTypes
): Promise<boolean> {
    if (isAdmin(userId)) return true;
    const permissionsObject = (await database.get(`${userId}`)) ?? { read: [], write: [] };
    return permissionsObject[action].includes(permission);
}

/**
 * Creates a permissions middleware that checks if the user
 * has the necessary permissions to continue.
 * @param permission The permission to check for.
 * @param action The action related to this permission.
 * @returns The created middleware.
 */
export function createPermissionsMiddleware(permission: PermissionTypes, action: PermissionActionTypes) {
    return createMiddleware(async (context, next) => {
        // TODO: implement proper auth once auth is ready
        const userId = context.get('id') ?? 0;
        if (!(await hasPermission(userId, permission, action)))
            return context.json({ error: `Forbidden, requires '${permission}' permission. (${action})` }, 403);
        return await next();
    });
}
