/**
 * A module for creating and validating captchas.
 *
 * Authored by Jacob Humston
 */
import { convertTo } from '@jacobhumston/tc.js';
import { createChallenge, verifySolution } from 'altcha-lib';
import { randomBytes } from 'crypto';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import { serverURL } from '@server/config';
import { Cache } from '@server/managers/cache';
import { DatabaseClient } from '@server/managers/database';
import { getSessionToken } from '@server/modules/secrets';

// hmac
const hmac = randomBytes(255).toString();

// we need to store already verified captchas
// note that the type is an empty object, as we only need the keys existence
const database = new DatabaseClient<{}>('captchas', 'verified');
const captchaBypassCache = new Cache<{}>('captcha-bypasses');

// clear old captchas
for (const captcha of Object.keys(await database.all())) {
    await database.delete(captcha);
}

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
 * **NOTE:** This function will NOT check if the user can bypass the captcha. Use {@linkcode verifyCaptchaFromContext} instead.
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
 * This function will also check if the user is able to bypass the captcha.
 * @param context The request context.
 * @returns A boolean indicating whether the challenge succeeded or not.
 */
export async function verifyCaptchaFromContext(context: Context) {
    const captcha = context.req.header('captcha') ?? '';
    if ((await isCaptchaBypassExpired(context)) === false) return true;
    const result = await verifyCaptcha(captcha);
    if (result === true) {
        const bypassToken = randomBytes(255).toString();
        await captchaBypassCache.set(bypassToken, {}, { minutes: 30 });
        setCookie(context, getSessionToken('captcha-bypass'), bypassToken, {
            expires: (await captchaBypassCache.expires(bypassToken)) as Date,
            domain: serverURL.hostname,
            secure: true,
            httpOnly: true,
            sameSite: 'strict'
        });
    }
    return result;
}

/**
 * Check if a captcha bypass token has expired or not. (Or even exists.)
 * @param context The context to check.
 * @returns A boolean indicating if the token has expired.
 */
export async function isCaptchaBypassExpired(context: Context) {
    const result = await captchaBypassCache.expires(getCookie(context, getSessionToken('captcha-bypass')) ?? '');
    if (result instanceof Date) return Date.now() > result.getTime();
    else return true; // bypass tokens should never have "never" as their expiration date
}

/** Captcha middleware, which can be used on routes that need extra security. */
export const captchaMiddleware = createMiddleware(async (context, next) => {
    const result = await verifyCaptchaFromContext(context);
    if (result === false) {
        if (!context.req.header('captcha')) return context.json({ error: 'Missing captcha.' }, 422) as any;
        else return context.json({ error: 'Invalid captcha.' }, 429) as any;
    }
    return await next();
});
