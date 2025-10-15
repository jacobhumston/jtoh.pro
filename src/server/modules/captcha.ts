/**
 * A module for creating and validating captchas.
 *
 * Authored by Jacob Humston
 */
import { createChallenge, verifySolution } from 'altcha-lib';
import { randomBytes } from 'crypto';

import { DatabaseClient } from '../managers/database';

// hmac
const hmac = randomBytes(255).toString();

// we need to store already verified captchas
const database = new DatabaseClient('captchas', 'verified');

/**
 * Create a captcha challenge.
 * @returns The captcha challenge.
 */
export async function createCaptcha() {
    return await createChallenge({ hmacKey: hmac, maxNumber: 500000, expires: new Date(Date.now() + 10 * 60 * 1000) });
}

/**
 * Verify a captcha challenge.
 * @param captcha The captcha token.
 * @returns A boolean indicating whether the challenge succeeded or not.
 */
export async function verifyCaptcha(captcha: string) {
    let result: boolean = await verifySolution(captcha, hmac, true);
    if (result === true) {
        if ((await database.exists(captcha)) === true) {
            result = false;
        } else {
            await database.set(captcha, {});
        }
    }
    return result;
}
