/**
 * This module handles client analytics.
 *
 * Authored by Jacob Humston
 */
import rybbit from '@rybbit/js';
import { waitFor } from 'poll-until-promise';

let analyticsReady = false;

/**
 * Init analytics.
 */
export async function initAnalytics() {
    await rybbit.init({ analyticsHost: 'https://stats.lovelyjacob.com/api', siteId: 'f2d69176066a' });
    analyticsReady = true;
}

/**
 * Rybbit package exported as default to
 * make events more accessible.
 */
export default rybbit;

/**
 * An analytics wrapping function that only executes the callback
 * when analytic methods are ready to execute.
 * @param callback The callback to execute when analytics are ready.
 */
export async function analyticsWrap(callback: () => unknown) {
    await waitFor(() => analyticsReady);
    callback();
}
