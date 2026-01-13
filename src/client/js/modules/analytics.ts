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
    await rybbit.init({ analyticsHost: 'https://analytics.lovelyjacob.com/api', siteId: '1' });
}

/**
 * Rybbit package exported as default to
 * make events more accessible.
 */
export default rybbit;
