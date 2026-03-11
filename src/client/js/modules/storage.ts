/**
 * This file handles local storage for the client.
 *
 * Authored by Jacob Humston
 */
import { createLocalStorage } from '@stork-tools/zod-local-storage';
import z from 'zod';

import { authInfoSchema } from '@schemas/auth';

const storageSchemas = {
    auth: authInfoSchema,
    profilePicture: z.string(),
    viewedNotifications: z.array(z.string())
};

/** Local storage. */
export const storage = createLocalStorage(storageSchemas);
export default storage;
