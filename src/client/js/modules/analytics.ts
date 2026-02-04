/**
 * This module handles client analytics.
 *
 * Authored by Jacob Humston
 */
import rybbit from '@rybbit/js';

/**
 * Init analytics.
 */
export async function initAnalytics() {
    await rybbit.init({ analyticsHost: 'https://stats.lovelyjacob.com/api', siteId: 'f2d69176066a' });
}

/**
 * Rybbit package exported as default to
 * make events more accessible.
 */
export default rybbit;
