import { isDev } from './dev';
import { getSignedInRobloxUser } from './loginauth';
import { cloudflareCaptchaSecret } from './tokens';
import { Hono } from 'hono';
import { v4 } from 'uuid';
import { captchaBypassDB } from './db';

export async function verifyCaptcha(token: string) {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            secret: cloudflareCaptchaSecret,
            response: token
        })
    }).catch(() => {
        return null;
    });
    if (!response) return false;
    const data = await response.json();
    return data.success && data.hostname === (isDev ? 'localhost' : 'jtoh.pro');
}

export async function verifyCaptchaBypass(userId: number, token: string) {
    if (!token) return false;
    const uuidRegex = /^[0-9a-fA-F-]+$/;
    if (!uuidRegex.test(token)) return null;
    if ((await captchaBypassDB.get('bypass-' + userId)) === token) return true;
}

export function captchaManager(app: Hono) {
    app.get('/ext/captcha/gateway', async (context) => {
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

    app.get('/ext/captcha/verify', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not signed in.' }, 401) as any;

        const token = context.req.query('token') ?? '';
        if (!token) return context.json({ error: 'No token provided.' }, 400) as any;

        const captchaPassed = await verifyCaptchaBypass(user.id, token);
        if (!captchaPassed) return context.json<{ error: string }>({ error: 'Captcha failed, please try again.' }, 400);

        return context.json({ success: true });
    });
}
