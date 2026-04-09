/**
 * Server sided analytics tracking.
 *
 * Authored by Jacob Humston
 */
import rybbit from 'rybbit.ts';

import apiTokens from '@server/modules/tokens';

/** Rybbit analytics. */
export const analytics = new rybbit({
    domain: 'https://stats.lovelyjacob.com',
    siteId: 1,
    apiKey: apiTokens.rybbitApiKey
});
