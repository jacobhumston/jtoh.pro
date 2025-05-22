import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { loginAuthDB } from './db';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { LoggedInUser, LoggedInUserWho } from './type';
import { robloxAdminUserId, robloxAuthClientId, robloxAuthSecret } from './tokens';
import { getURL, getURLHost } from './dev';
import { verifyCaptcha } from './captcha';
import { getTempToken } from './temp-tokens';
import { encryptCode, decryptCode } from './util';
import crypto from 'node:crypto';
import type { BasicRobloxUserResult, RobloxUserResult } from './roblox';
import { userIdToUser, userIdToThumbnail, usernameToUser } from './roblox';
import jtohGroupMembers from '../etc/group-members/jtoh.json';
import rvsGroupMembers from '../etc/group-members/rvs.json';
import cscdGroupMembers from '../etc/group-members/cscd.json';
import { cookieSecret } from './cookies';
import { UAParser } from 'ua-parser-js';
import fs from 'node:fs';
import { convertTo } from '@jacobhumston/tc.js';
import { getIP } from './ip';
import { v4 } from 'uuid';

if (!fs.existsSync('cache')) fs.mkdirSync('cache');

const hashingTokenForCodes = crypto
    .createHash('sha256')
    .update(getTempToken('hashingTokenForCodes'))
    .digest('base64')
    .substr(0, 32);

if (!fs.existsSync('cache/ua-hash')) fs.writeFileSync('cache/ua-hash', getTempToken('hashingTokenForUserAgents'));

const hashingTokenForUA = crypto
    .createHash('sha256')
    .update(fs.readFileSync('cache/ua-hash', 'utf-8'))
    .digest('base64')
    .substr(0, 32);

if (!fs.existsSync('cache/authtokens-hash'))
    fs.writeFileSync('cache/authtokens-hash', getTempToken('hashingTokenForAuthTokens'));

const hashingTokenForAuthTokens = crypto
    .createHash('sha256')
    .update(fs.readFileSync('cache/authtokens-hash', 'utf-8'))
    .digest('base64')
    .substr(0, 32);

export default function setupLoginAuth(app: Hono) {
    app.get('/api/auth/@me', async (context) => {
        const user = await getSignedInRobloxUser(context);
        return context.json({ user: user, admin: await isSignedInAdmin(context) });
    });

    app.get('/api/auth', async (context) => {
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
                        //for await (const [key, value] of loginAuthDB.iterator()) {
                        //    if (value.id == parseInt(userResponseJSON.sub)) {
                        //        await loginAuthDB.delete(key);
                        //    }
                        //}
                        const parsedUserAgent = new UAParser(context.req.header('User-Agent'), context.req.raw.headers);
                        const browser = await parsedUserAgent.getBrowser().withClientHints();
                        const device = await parsedUserAgent.getDevice().withClientHints();
                        const os = await parsedUserAgent.getOS().withClientHints();
                        if (!browser.name) return context.redirect(getAuthLoginURL());
                        const token =
                            crypto.randomBytes(256).toString('hex') +
                            '::' +
                            encryptCode(encodeURIComponent(context.req.header('User-Agent') ?? ''), hashingTokenForUA);
                        await loginAuthDB.set<LoggedInUserWho>(
                            token,
                            {
                                id: parseInt(userResponseJSON.sub),
                                username: userResponseJSON.preferred_username,
                                name: userResponseJSON.name,
                                thumbnail: userResponseJSON.picture ?? '',
                                who: {
                                    ip: getIP(context),
                                    browser: browser.name ?? 'Unknown',
                                    device: {
                                        type: device.type ?? 'Unknown',
                                        vendor: device.vendor ?? 'Unknown',
                                        os: {
                                            name: os.name ?? 'Unknown',
                                            version: os.version ?? 'Unknown'
                                        }
                                    }
                                },
                                sessionId: `${v4()}-${v4()}`
                            },
                            convertTo({ weeks: 3 }, 'milliseconds')
                        );
                        await setSignedCookie(
                            context,
                            'auth-token',
                            encryptCode(token, hashingTokenForAuthTokens),
                            cookieSecret,
                            {
                                httpOnly: true,
                                sameSite: 'Strict',
                                secure: true,
                                expires: new Date(Date.now() + convertTo({ weeks: 3 }, 'milliseconds')),
                                domain: getURLHost(),
                                signingSecret: cookieSecret
                            }
                        );
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
        return context.redirect('/app/?loginRedirect=true');
    });

    app.get('/api/auth/logout', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Not signed in.' }, 401);
        const token = decryptCode(
            (await getSignedCookie(context, cookieSecret, 'auth-token')) as string,
            hashingTokenForAuthTokens
        );
        await loginAuthDB.delete(token);

        deleteCookie(context, 'auth-token', {
            httpOnly: true,
            sameSite: 'Strict',
            secure: true,
            domain: getURLHost(),
            signingSecret: cookieSecret
        });

        if (context.req.query('single') !== 'true') {
            // @ts-ignore-next-line
            for await (const [key, value] of loginAuthDB.iterator()) {
                if (value.id == user.id) {
                    await loginAuthDB.delete(key);
                }
            }
        }
        if (context.req.query('switch') === 'true') return context.redirect('/login');
        return context.redirect('/');
    });
}

export async function getSignedInRobloxUser(context: Context): Promise<LoggedInUser | null> {
    let token = await getSignedCookie(context, cookieSecret, 'auth-token');
    if (!token) {
        if (context.req.query('authToken') && context.req.path.startsWith('/api/admin/')) {
            token = context.req.query('authToken') ?? '';
        } else {
            return null;
        }
    }

    try {
        token = decryptCode(token, hashingTokenForAuthTokens);
    } catch {
        token = undefined;
    }

    if (!token) return null;

    if (!context.req.path.startsWith('/api/admin/')) {
        const ua = token.split('::')[1];
        if (!ua) return null;
        let uaSuccess = false;
        try {
            if (decryptCode(ua, hashingTokenForUA) == encodeURIComponent(context.req.header('User-Agent') ?? ''))
                uaSuccess = true;
        } catch {
            uaSuccess = false;
        }

        if (!uaSuccess) return null;
    }

    const data = (await loginAuthDB.get<LoggedInUserWho>(token)) ?? null;
    if (!data) return data;
    // @ts-expect-error
    data.who = undefined;
    // @ts-expect-error
    data.sessionId = undefined;
    return data;
}

export function getAuthLoginURL() {
    return `https://apis.roblox.com/oauth/v1/authorize?client_id=${robloxAuthClientId}&redirect_uri=${getURL()}/api/auth&scope=openid%20profile&response_type=code`;
}

export async function isSignedInAdmin(context: Context) {
    const user = await getSignedInRobloxUser(context);
    if (!user) return false;
    return user.id === robloxAdminUserId;
}

export async function parseRobloxAccountV2(
    providedUser: string,
    context?: Context
): Promise<RobloxUserResult | undefined> {
    let user: BasicRobloxUserResult | undefined = undefined;
    if (providedUser.startsWith('!')) {
        user = await userIdToUser(parseInt(providedUser.slice(1))).catch(() => undefined);
    } else if (providedUser === '$me' && context) {
        let me = await getSignedInRobloxUser(context);
        if (!me) return undefined;
        user = await userIdToUser(me.id).catch(() => undefined);
    } else if (providedUser === '$random') {
        user = await userIdToUser(
            // @ts-ignore-next-line
            jtohGroupMembers.members[Math.floor(Math.random() * jtohGroupMembers.members.length)].id
        ).catch(() => undefined);
    } else if (providedUser === '$random:rsv') {
        user = await userIdToUser(
            // @ts-ignore-next-line
            rvsGroupMembers.members[Math.floor(Math.random() * rvsGroupMembers.members.length)].id
        ).catch(() => undefined);
    } else if (providedUser === '$random:cscd') {
        user = await userIdToUser(
            // @ts-ignore-next-line
            cscdGroupMembers.members[Math.floor(Math.random() * cscdGroupMembers.members.length)].id
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

export async function parseRobloxAccount(context: Context): Promise<RobloxUserResult | undefined> {
    const providedUser: string = context.req.param('user').slice(0, 20);
    if (!providedUser || providedUser.length < 1) return undefined;
    return await parseRobloxAccountV2(providedUser, context);
}
