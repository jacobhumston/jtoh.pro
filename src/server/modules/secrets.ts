/**
 * This module handles server secrets.
 * Used for getting API tokens and encrypting/decrypting data.
 *
 * Authored by Jacob Humston
 */
import { CryptrAsync } from 'cryptr';
import { read } from 'read';

import { randomBytes } from 'node:crypto';

import { DatabaseClient } from '@server/managers/database';
import { log } from '@server/modules/logger';

const secretsDatabase = new DatabaseClient<string>('secrets', 'sec');
const sessionTokens: Map<string, string> = new Map();

// Get the server passphrase.
const passphrase = await read({ prompt: 'Please provide the server passphrase:', silent: true, replace: '*' });
console.clear();

// Save passphrase if not already present.
if (!(await secretsDatabase.get<string>('passphrase'))) {
    log('info', 'Saved passphrase not found, saving the provided passphrase.');
    await secretsDatabase.set('passphrase', await Bun.password.hash(passphrase));
}

// Check passphrase.
if ((await Bun.password.verify(passphrase, (await secretsDatabase.get<string>('passphrase')) ?? '')) === false)
    throw new Error('Passphrase was invalid!');

// Create a cryptr instance.
const cryptr = new CryptrAsync(passphrase);

/** Encrypt a string. */
export const encrypt = cryptr.encrypt;

/** Decrypt a string. */
export const decrypt = cryptr.decrypt;

/**
 * Get a session token by name.
 * This will generate a new token if it doesn't already exist.
 * @param name The name of the session token to get.
 * @returns The session token.
 */
export function getSessionToken(name: string): string {
    const token = sessionTokens.get(name);
    if (!token) {
        const newToken = generateRawToken();
        sessionTokens.set(name, newToken);
        return newToken;
    } else {
        return token;
    }
}

/**
 * Generate a raw token.
 * Note that this does NOT add it to the session token map.
 * @returns The created token.
 */
export function generateRawToken() {
    return randomBytes(255).toBase64();
}

/**
 * Get a secrete. Will create one if it doesn't already exist.
 * @param name The name of the secret to get.
 * @returns The content's of the requested secret.
 */
export async function getSecret(name: string): Promise<string> {
    const found = await secretsDatabase.get(name);
    if (!found) {
        const secret = generateRawToken();
        await secretsDatabase.set(name, secret);
        return secret;
    } else {
        return found;
    }
}
