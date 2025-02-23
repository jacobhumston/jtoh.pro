const debounces: { [key: string]: boolean } = {};

/**
 * Create a debounce for the specified key.
 * This will return instantly if the debounce is already created.
 * @param key The debounce key.
 */
export function createMissingDebounceKey(key: string) {
    if (debounces[key] !== undefined) return;
    debounces[key] = false;
}

/**
 * Check if the debounce is active.
 * @param key The debounce key.
 * @returns Whether the debounce is active.
 */
export function isDebounceActive(key: string): boolean {
    createMissingDebounceKey(key);
    return debounces[key];
}

/**
 * Set the debounce to active.
 * @param key The debounce key.
 */
export function setDebounceActive(key: string) {
    createMissingDebounceKey(key);
    debounces[key] = true;
}

/**
 * Set the debounce to inactive.
 * @param key The debounce key.
 */
export function setDebounceInactive(key: string) {
    createMissingDebounceKey(key);
    debounces[key] = false;
}
