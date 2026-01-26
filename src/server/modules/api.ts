/**
 * API client for the server.'
 *
 * Authored by Jacob Humston
 */
import createClient from 'openapi-fetch';

import { serverURL } from '@server/config';
import { getSessionToken } from '@server/modules/secrets';
import type { paths } from '@shared/api-types';

/** API Client */
export const client = createClient<paths>({ baseUrl: serverURL.href });
client.use({
    onRequest: (options) => {
        options.request.headers.set('ratelimit-bypass', getSessionToken('ratelimit-bypass'));
    }
});
