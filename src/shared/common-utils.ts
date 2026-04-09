/**
 * Common utils used throughout the codebase. (both server/client)
 * These methods should generally never interact with each other.
 *
 * Authored by Jacob Humston
 */

/**
 * Create a promise that resolves once the timeout is completed.
 * @param ms The number of milliseconds for the created timeout.
 * @returns A promise that resolves once the timeout is completed.
 */
export function createTimeoutPromise(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * This method returns `string` if the string's length is greater then `0`.
 * If the string length is `0`, then it returns `replacer`.
 * @param string The original string to check.
 * @param replacer The replacing string if the check fails.
 * @returns `string` or `replacer` depending on whether `string.length` is greater then `0`.
 */
export function replaceEmptyString(string: string, replacer: string) {
    if (string.length > 0) return string;
    return replacer;
}

/**
 * A simple utility function to safely create urls.
 * @param url The url to create.
 * @returns The resulting url, or undefined if it was invalid.
 */
export function safeURL(url: string): URL | undefined {
    let result;
    try {
        result = new URL(url);
        if (result.protocol !== 'http:' && result.protocol !== 'https:') result = undefined;
    } catch {
        result = undefined;
    }
    return result;
}
