/**
 * API client for the client.
 *
 * Authored by Jacob Humston
 */
import createClient from 'openapi-fetch';

import type { paths } from '@shared/api-types';

/** API Client */
export const client = createClient<paths>();
