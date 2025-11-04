/**
 * A module for creating and validating captchas.
 *
 * Authored by Jacob Humston
 */
import { convertTo } from '@jacobhumston/tc.js';
import { createChallenge, verifySolution } from 'altcha-lib';
import { randomBytes } from 'crypto';
import type { Context } from 'hono';

import { DatabaseClient } from '../managers/database';

// hmac
const hmac = randomBytes(255).toString();

// we need to store already verified captchas
// note that the type is an empty object, as we only need the keys existence
const database = new DatabaseClient<{}>('captchas', 'verified');

/**
 * Create a captcha challenge.
 * @returns The captcha challenge.
 */
export async function createCaptcha() {
    return await createChallenge({
        hmacKey: hmac,
        maxNumber: 500000,
        expires: new Date(Date.now() + convertTo({ minutes: 10 }, 'milliseconds'))
    });
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

/**
 * Verify a captcha challenge from a request context.
 * This function is a request wrapper for {@linkcode verifyCaptcha}.
 * @param context The request context.
 * @returns A boolean indicating whether the challenge succeeded or not.
 */
export async function verifyCaptchaFromContext(context: Context) {
    const captcha = context.req.header('captcha') ?? '';
    return await verifyCaptcha(captcha);
}
