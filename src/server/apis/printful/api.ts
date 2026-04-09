/**
 * API client for the printful API.
 *
 * Authored by Jacob Humston
 */
import createClient from 'openapi-fetch';

import type { v1, v2 } from '@server/apis/printful/types';
import apiTokens from '@server/modules/tokens';

/** API Client */
export const client = createClient<v1.paths & v2.paths>({
    baseUrl: 'https://api.printful.com',
    headers: { Authorization: 'Bearer ' + apiTokens.printfulToken }
});
