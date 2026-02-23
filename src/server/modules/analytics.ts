/**
 * Server sided analytics tracking.
 *
 * Authored by Jacob Humston
 */
import { Rybbit } from '@rybbit/node';

import apiTokens from './tokens';

export const analytics = new Rybbit({
    analyticsHost: 'https://stats.lovelyjacob.com',
    siteId: 'f2d69176066a',
    apiKey: apiTokens.rybbitApiKey
});
