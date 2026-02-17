/**
 * This file handles local storage for the client.
 *
 * Authored by Jacob Humston
 */
import { createLocalStorage } from '@stork-tools/zod-local-storage';

import { authInfoSchema } from '@shared/schemas/auth';

const storageSchemas = {
    auth: authInfoSchema
};

/** Local storage. */
export const storage = createLocalStorage(storageSchemas);
export default storage;
