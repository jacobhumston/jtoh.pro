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

const secretsDatabase = new DatabaseClient('secrets', 'sec');
const sessionTokens: Map<string, string> = new Map();

// Get the server passphrase.
let passphrase = await read({ prompt: 'Please provide the server passphrase:', silent: true, replace: '*' });
console.clear();

// Save passphrase if not already present.
if (!(await secretsDatabase.get<string>('passphrase'))) {
    log('info', 'Saved passphrase not found, saving the provided passphrase.');
    await secretsDatabase.set('passphrase', await Bun.password.hash(passphrase));
}

// Check passphrase.
if ((await Bun.password.verify(passphrase, (await secretsDatabase.get<string>('passphrase')) ?? '')) == false)
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
        const newToken = randomBytes(16).toString('utf8');
        sessionTokens.set(name, newToken);
        return newToken;
    } else {
        return token;
    }
}
