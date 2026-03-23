/**
 * Captcha module, handling captchas.
 *
 * Authored by Jacob Humston
 */
import { solveChallengeWorkers } from 'altcha-lib';
import type { Payload } from 'altcha-lib/types';

import { client } from '@client/modules/api';

/**
 * Solve a captcha.
 * Note: Use `getCaptchaToken()` to get the valid token.
 * @returns Captcha results.
 */
export async function solveCaptcha() {
    const captcha = await client.GET('/api/captcha');
    if (!captcha.data) throw new Error('Failed to get captcha challenge.');

    const solution = await solveChallengeWorkers(
        () => new Worker(new URL('/js/workers/captcha.js', import.meta.url), { type: 'module' }),
        navigator.hardwareConcurrency ?? 8,
        captcha.data.challenge,
        captcha.data.salt,
        captcha.data.algorithm,
        captcha.data.maxnumber
    );

    return {
        captcha,
        solution
    };
}

/**
 * Get a captcha token from `solveCaptcha()`.
 * This also handles skips.
 * @returns
 */
export async function getCaptchaToken(): Promise<string> {
    const canSkip = await client.GET('/api/captcha/skip');
    if (canSkip.data?.success) return '';

    const { solution, captcha } = await solveCaptcha();

    if (!solution?.number) throw new Error('Missing captcha solution.');

    const solutionPayload: Payload = {
        algorithm: captcha.data.algorithm,
        challenge: captcha.data.challenge,
        number: solution.number,
        salt: captcha.data.salt,
        signature: captcha.data.signature
    };
    const solutionToken = btoa(JSON.stringify(solutionPayload));

    return solutionToken;
}
