/**
 * Server sided analytics tracking.
 *
 * Authored by Jacob Humston
 */
import rybbit from 'rybbit.ts';

import apiTokens from './tokens';

/** Rybbit analytics. */
export const analytics = new rybbit('https://stats.lovelyjacob.com', 1, apiTokens.rybbitApiKey);
