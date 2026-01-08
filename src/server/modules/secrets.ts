/**
 * This module handles server secrets.
 * Used for getting API tokens and encrypting/decrypting data.
 *
 * Authored by Jacob Humston
 */
import { CryptrAsync } from 'cryptr';
import { read } from 'read';

import { DatabaseClient } from '@server/managers/database';
import { log } from '@server/modules/logger';

const secretsDatabase = new DatabaseClient('secrets', 'sec');

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
