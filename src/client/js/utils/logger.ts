/**
 * Simple client logger module that only logs on localhost.
 *
 * Authored by Jacob Humston
 */

/**
 * Disable console.log if the client is currently not on localhost.
 */
export function disableConsoleLogIfNotLocalhost() {
    const host = window.location.hostname;
    if (host !== 'localhost') globalThis.console.log = () => {};
}
