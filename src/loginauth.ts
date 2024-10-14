import { getCookie, setCookie } from 'hono/cookie';
import { loginAuthDB } from './db';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { LoggedInUser } from './type';
import { robloxAuthClientId, robloxAuthSecret } from './tokens';
import { isDev } from './dev';
import { v4 } from 'uuid';

export default function setupLoginAuth(app: Hono) {
    app.get('/ext/auth/@me', async (context) => {
        const user = await getSignedInRobloxUser(context);
        return context.json({ user: user });
    });

    app.get('/ext/auth', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (user) return context.redirect('/app/');
        const code = context.req.query('code');
        if (!code) return context.redirect(getAuthLoginURL());
        let failed: null | boolean = null;

        fetch('https://apis.roblox.com/oauth/v1/token', {
            body: new URLSearchParams({
                code: code,
                client_id: robloxAuthClientId,
                client_secret: robloxAuthSecret,
                grant_type: 'authorization_code'
            }),
            method: 'post'
        })
            .then(async (tokenResponse) => {
                const tokenResponseJSON = await tokenResponse.json();
                if (!tokenResponseJSON.access_token) {
                    failed = true;
                    return;
                }
                const userResponse = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
                    headers: {
                        Authorization: `Bearer ${tokenResponseJSON.access_token}`
                    }
                })
                    .then(async (userResponse) => {
                        const userResponseJSON = await userResponse.json();
                        if (!userResponseJSON.sub) {
                            failed = true;
                            return;
                        }
                        const token = `${v4()}-${v4()}-${v4()}-${v4()}-${v4()}-${v4()}`;
                        await loginAuthDB.set(
                            token,
                            {
                                id: parseInt(userResponseJSON.sub),
                                username: userResponseJSON.preferred_username,
                                name: userResponseJSON.name,
                                thumbnail: userResponseJSON.picture ?? ''
                            },
                            3 * 24 * 60 * 60 * 1000
                        );
                        setCookie(context, 'auth-token', token);
                        failed = false;
                    })
                    .catch(() => {
                        failed = true;
                    });
            })
            .catch(() => {
                failed = true;
            });

        await new Promise((resolve) =>
            setInterval(function () {
                if (failed !== null) {
                    resolve(0);
                }
            }, 0)
        );

        if (failed == true) return context.redirect(getAuthLoginURL());
        return context.redirect('/app/');
    });

    app.get('/ext/auth/logout', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not signed in.' }, 401);
        const token = getCookie(context, 'auth-token') as string;
        await loginAuthDB.delete(token);
        setCookie(context, 'auth-token', '', { expires: new Date(0) });
        return context.json({ success: true });
    });
}

export async function getSignedInRobloxUser(context: Context) {
    const token = getCookie(context, 'auth-token');
    if (!token) return null;
    const uuidRegex = /^[0-9a-fA-F-]+$/;
    if (!uuidRegex.test(token)) return null;
    return (await loginAuthDB.get<LoggedInUser>(token)) ?? null;
}

export function getAuthLoginURL() {
    return `https://apis.roblox.com/oauth/v1/authorize?client_id=${robloxAuthClientId}&redirect_uri=${isDev ? 'http://localhost/ext/auth' : 'http://jtoh.pro/ext/auth'}&scope=openid%20profile&response_type=code`;
}
