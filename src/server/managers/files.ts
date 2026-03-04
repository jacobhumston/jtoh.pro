/**
 * This script manages files, mostly ensuring their existence.
 * However this script does come with neat file utilities.
 *
 * Authored by Jacob Humston
 */
import { createHash, type BinaryToTextEncoding } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync } from 'node:fs';
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
    if (!existsSync(path)) {
        // no need to make a directory if the path lookup is a file
        if (!path.includes('.')) mkdirSync(path, { recursive: true });
    }
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

/**
 * Get the hash of a file.
 * @param filePath The path to hash.
 * @param algorithm The algorithm to use.
 * @param encoding Encoding to use.
 * @returns The hash.
 */
export function getFileHash(
    filePath: string,
    algorithm: string = 'sha256',
    encoding: BinaryToTextEncoding = 'hex'
): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = createHash(algorithm);
        const stream = createReadStream(filePath);

        stream.on('error', (err) => {
            reject(err);
        });

        stream.on('data', (chunk) => {
            hash.update(chunk);
        });

        stream.on('end', () => {
            resolve(hash.digest(encoding));
        });
    });
}
