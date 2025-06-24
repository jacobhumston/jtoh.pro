import { getSignedInRobloxUser } from './login-auth';
import { Hono, type Context } from 'hono';
import { v4 } from 'uuid';
import { captchaBypassDB, captchaTokensDB } from './db';
import { createChallenge, verifySolution } from 'altcha-lib';
import crypto from 'node:crypto';
import { convertTo } from '@jacobhumston/tc.js';

export const hmac = crypto.randomBytes(255).toString('utf8');
export const maxNumber = 400000;

export async function verifyCaptcha(token: string): Promise<boolean> {
    const ok = await verifySolution(token, hmac);
    const found = await captchaTokensDB.get(token);
    if (found) return false;
    if (ok) {
        await captchaTokensDB.set(token, true);
    }
    return ok;
}

export async function verifyCaptchaBypass(userId: number, token: string) {
    if (!token) return false;
    const uuidRegex = /^[0-9a-fA-F-]+$/;
    if (!uuidRegex.test(token)) return null;
    if ((await captchaBypassDB.get('bypass-' + userId)) === token) return true;
}

export function captchaManager(app: Hono) {
    app.get('/api/captcha/gateway', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not signed in.' }, 401) as any;

        const token = context.req.query('token') ?? '';
        if (!token) return context.json({ error: 'No token provided.' }, 400) as any;

        const captchaPassed = await verifyCaptcha(token);
        if (!captchaPassed) return context.json<{ error: string }>({ error: 'Captcha failed, please try again.' }, 400);

        const gatewayToken = `${v4()}-${v4()}-${v4()}-${v4()}-${v4()}`;
        await captchaBypassDB.set('bypass-' + user.id, gatewayToken, 10 * 60 * 1000);
        return context.json({ token: gatewayToken });
    });

    app.get('/api/captcha/verify', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not signed in.' }, 401) as any;

        const token = context.req.query('token') ?? '';
        if (!token) return context.json({ error: 'No token provided.' }, 400) as any;

        const captchaPassed = await verifyCaptchaBypass(user.id, token);
        if (!captchaPassed) return context.json<{ error: string }>({ error: 'Captcha failed, please try again.' }, 400);

        return context.json({ success: true });
    });

    app.get('/api/captcha/get', async (context) => {
        const challenge = await createChallenge({
            hmacKey: hmac,
            expires: new Date(Date.now() + convertTo({ minutes: 10 }, 'milliseconds')),
            maxNumber: maxNumber
        });

        return context.json(challenge);
    });
}

export async function verifyContext(context: Context) {
    const token = context.req.query('captcha') ?? '';
    const user = await getSignedInRobloxUser(context);
    if (user) {
        const success = await verifyCaptchaBypass(user.id, token);
        if (!success) return context.json({ error: 'Captcha failed, please try again.' }, 400) as any;
    } else {
        const captchaPassed = await verifyCaptcha(token);
        if (!captchaPassed) return context.json<{ error: string }>({ error: 'Captcha failed, please try again.' }, 400);
    }
}
