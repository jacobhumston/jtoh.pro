/**
 * These are declared variables that may need to be
 * accessed by the client and the server.
 *
 * Authored by Jacob Humston
 */

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
