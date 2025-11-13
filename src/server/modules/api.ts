/**
 * API client for the server.
 */
import createClient from 'openapi-fetch';

import type { paths } from '../../shared/api-types';
import { serverURL } from '../config';

/** API Client */
export const client = createClient<paths>({ baseUrl: serverURL.href });
