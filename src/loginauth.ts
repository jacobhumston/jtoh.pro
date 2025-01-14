import { getCookie, setCookie } from 'hono/cookie';
import { loginAuthDB } from './db';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { LoggedInUser } from './type';
import { robloxAdminUserId, robloxAuthClientId, robloxAuthSecret } from './tokens';
import { getURL } from './dev';
import { v4 } from 'uuid';
import { isDev } from './dev';
import { verifyCaptcha } from './captcha';
import { getTempToken } from './temptokens';
import { encryptCode, decryptCode } from './util';
import crypto from 'node:crypto';
import type { BasicRobloxUserResult, RobloxUserResult } from './roblox';
import { userIdToUser, userIdToThumbnail, usernameToUser } from './roblox';
import jtohGroupMembers from '../etc/group-members/jtoh.json';

const hashingTokenForCodes = crypto
    .createHash('sha256')
    .update(String(getTempToken('hashingTokenForCodes')))
    .digest('base64')
    .substr(0, 32);

export default function setupLoginAuth(app: Hono) {
    app.get('/ext/auth/@me', async (context) => {
        const user = await getSignedInRobloxUser(context);
        return context.json({ user: user, admin: await isSignedInAdmin(context) });
    });

    app.get('/ext/auth', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (user) return context.redirect('/app/');
        let code = context.req.query('code');
        if (!code) return context.redirect(getAuthLoginURL());
        let failed: null | boolean = null;
        const captcha = context.req.query('captcha');
        if ((await verifyCaptcha(captcha ?? '')) !== true)
            return context.redirect(`/app/captcha?type=auth&code=${encryptCode(code, hashingTokenForCodes)}`);

        code = decryptCode(code, hashingTokenForCodes);

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
                fetch('https://apis.roblox.com/oauth/v1/userinfo', {
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
                        // @ts-ignore-next-line
                        for await (const [key, value] of loginAuthDB.iterator()) {
                            if (value.id == parseInt(userResponseJSON.sub)) {
                                await loginAuthDB.delete(key);
                            }
                        }
                        const token = `${v4()}-${v4()}-${v4()}-${v4()}-${v4()}-${v4()}-${v4()}-${v4()}`;
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
                        setCookie(context, 'auth-token', token, {
                            httpOnly: true,
                            sameSite: 'Strict',
                            secure: isDev ? false : true,
                            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                        });
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
        if (context.req.query('switch') && context.req.query('switch') === 'true') return context.redirect('/login');
        return context.redirect('/');
    });
}

export async function getSignedInRobloxUser(context: Context) {
    const token = getCookie(context, 'auth-token');
    if (!token) return null;
    const uuidRegex = /^[0-9a-fA-F-]+$/;
    if (!uuidRegex.test(token)) return null;
    return (await loginAuthDB.get<LoggedInUser>(token)) ?? null;
}

export async function getSignedInRobloxUserAuthToken(context: Context) {
    const token = getCookie(context, 'auth-token');
    if (!token) return null;
    const uuidRegex = /^[0-9a-fA-F-]+$/;
    if (!uuidRegex.test(token)) return null;
    return ((await loginAuthDB.get<LoggedInUser>(token)) ?? null) ? token : null;
}

export function getAuthLoginURL() {
    return `https://apis.roblox.com/oauth/v1/authorize?client_id=${robloxAuthClientId}&redirect_uri=${getURL()}/ext/auth&scope=openid%20profile&response_type=code`;
}

export async function isSignedInAdmin(context: Context) {
    const user = await getSignedInRobloxUser(context);
    if (!user) return false;
    return user.id === robloxAdminUserId;
}

export async function parseRobloxAccount(context: Context): Promise<RobloxUserResult | undefined> {
    const providedUser: string = context.req.param('user').slice(0, 20);
    let user: BasicRobloxUserResult | undefined = undefined;
    if (providedUser.startsWith('!')) {
        user = await userIdToUser(parseInt(providedUser.slice(1))).catch(() => undefined);
    } else if (providedUser === '$me') {
        let me = await getSignedInRobloxUser(context);
        if (!me) return undefined;
        user = await userIdToUser(me.id).catch(() => undefined);
    } else if (providedUser === '$random') {
        user = await userIdToUser(
            // @ts-ignore-next-line
            jtohGroupMembers.members[Math.floor(Math.random() * jtohGroupMembers.members.length)].id
        ).catch(() => undefined);
    } else {
        user = await usernameToUser(providedUser).catch(() => undefined);
    }
    const data =
        user !== undefined
            ? {
                  id: user.id,
                  name: user.name,
                  displayName: user.displayName,
                  thumbnail: await userIdToThumbnail(user.id).catch(() => undefined)
              }
            : undefined;
    return data;
}
