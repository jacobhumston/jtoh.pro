/**
 * This script manages files, mostly ensuring their existence.
 * However this script does come with neat file utilities.
 *
 * Authored by Jacob Humston
 */

import { existsSync, mkdirSync } from 'node:fs';
import { cwd } from 'node:process';

/**
 * Get a path, will also create it if it doesn't exist.
 * For example, using `getPath('db')` will return `{project dir}/db`.
 * `{project dir}` will be the cwd, which SHOULD always be the project directory.
 * @param path The path to get. Should not start with `/`
 * @returns The full path, creating it if it doesn't exist.
 */
export function safelyGetPath(path: string) {
    // This error is only thrown because 'project//path' looks ugly and I want
    // to keep the file paths somewhat consistent.
    if (path.startsWith('/')) throw new Error('Path should not start with a /');
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    return `${cwd()}/${path}`;
}

/**
 * Execute `safelyGetPath` on an array.
 * @param paths The array of paths to get.
 * @returns The new paths.
 */
export function safelyGetPathMulti(paths: Array<string>) {
    return paths.map((path) => safelyGetPath(path));
}

/**
 * Create a path/folder if it doesn't already exist.
 * @param path The path to create.
 */
export function createPath(path: string): void {
    if (path.startsWith('/')) throw new Error('Path should not start with a /');
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    return;
}
