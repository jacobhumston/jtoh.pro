import { Hono } from 'hono';
import { GlobalFonts } from '@napi-rs/canvas';
import etohGen from './gens/etoh';
import discordInteractions, { publishDiscordCommands } from './discord-bot/discord';
import redirects from './redirects';
import serveStatic from './static';
import logger from './logger';
import fs from 'node:fs';
import webUtils from './web-utils';
import serveLeaderboards from './leaderboards';
import { isDev, getURL, port, getURLHost, isBeta, getURLObj, usingCustomUrl } from './dev';
import setupLoginAuth from './login-auth';
import { rateLimiter } from 'hono-rate-limiter';
import { getTempToken } from './temp-tokens';
import { convert as timeConvert } from '@jacobhumston/tc.js';
import { admin } from './admin';
import { captchaManager } from './captcha';
import { charts } from './chart';
import { parseRobloxAccount } from './login-auth';
import { quickWebTest } from './quick-web-test';
import { blog } from './blog';
import type { Serve } from 'bun';
import { socket, socketListen } from './socket';
//import { compress } from 'hono-compress';
import { cors } from 'hono/cors';
import { serveSitemap } from './sitemap';
import { csrf } from 'hono/csrf';
import { secureHeaders } from 'hono/secure-headers';
import { badgesEndpoints } from './roblox-badges';
import credits from './credits';
import { handleRequestCount } from './request-count';
import cscdGen from './gens/cscd';
import { cardImageCheck } from './card-images';
import { setupAccountEndpoints } from './account-settings';
import previewGen from './gens/preview';
import listenForPackageLists from './packages';
import { cleanUpTemp } from './files';
import { getIP } from './ip';
import embed from './embeddable';
import gameRequests from './game-requests';
import { mods } from './mods';
import otohGen from './gens/otoh';
import { gitHash } from './git-hash';

cleanUpTemp();
cardImageCheck();

const app = new Hono({
    getPath: (request) => {
        const url = new URL(request.url);
        //const host = url.host;
        return url.pathname;
    }
});

GlobalFonts.registerFromPath('src/web/app/assets/Poppins-Regular.ttf', 'Poppins');
GlobalFonts.registerFromPath('src/web/app/assets/Twemoji.ttf', 'Twemoji');
GlobalFonts.registerFromPath('src/web/app/assets/MaterialSymbolsRounded.woff2', 'MaterialSymbolsRounded');

app.use(
    cors({
        origin: getURL(),
        credentials: false,
        allowMethods: ['GET', 'POST', 'OPTIONS']
    })
);

app.use(
    csrf({
        origin: (origin) => {
            const url = new URL(origin);
            return url.origin === getURLObj().origin;
        }
    })
);

app.use(async (context, next) => {
    const getHighEntropyValues =
        'Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Form-Factors';
    context.res.headers.set('Accept-CH', getHighEntropyValues);
    context.res.headers.set('Critical-CH', getHighEntropyValues);
    return await next();
});

app.use(async (context, next) => {
    const excludedPaths = ['/embeddable', '/api/embeddable'];
    if (excludedPaths.some((path) => context.req.path.startsWith(path))) {
        return await next();
    }
    return await secureHeaders()(context, next);
});

//app.use(compress());

app.use(async (context, next) => {
    if (usingCustomUrl) return await next();
    const host = context.req.header('host');
    if (host) {
        let link: URL;
        try {
            link = new URL(context.req.url);
        } catch {
            return context.json({ error: 'Invalid host.' }, 400);
        }

        if (link.host === 'etoh.pro' || link.host === 'roblox-obby.pro')
            return context.redirect(getURL() + '/app/profile-creator/');

        if (host.endsWith('.etoh.pro') || host.endsWith('.roblox-obby.pro') || host.endsWith('.jtoh.pro')) {
            return context.redirect(getURL() + '/app/profile-creator/?ref=' + host.split('.')[0]);
        }

        if (link.host === getURLObj().host) return await next();
        return context.redirect(getURL() + link.pathname + link.search);
    } else {
        return context.json({ error: 'Invalid host.' }, 400);
    }
});

app.use(
    rateLimiter({
        windowMs: timeConvert({ minutes: 1 }).milliseconds,
        limit: 120,
        standardHeaders: 'draft-6',
        keyGenerator: (context) => {
            return `${getIP(context)}::${context.req.path}`;
        },
        handler: async (context) => {
            return context.json({ error: 'Rate limit exceeded. Please wait and try again.' }, 429) as any;
        },
        skip: async (context) => {
            return (context.req.query('rlb-token') ?? '') === getTempToken('rlb-token');
        }
        /*
        skipSuccessfulRequests: true,
        requestWasSuccessful: async (context) => {
            context.res.headers.forEach((value, key) => {
                if (key.startsWith('ratelimit')) context.res.headers.set(`x-${key}`, value);
            });
            return false;
        }
        */
    })
);

app.get('/api/vars', async (context) => {
    return context.json({
        usingCustomUrl,
        version: gitHash
    });
});

app.get('/app/templates/*', async (context) => {
    return context.json({ error: 'Not found.' }, 404);
});

setupLoginAuth(app);
captchaManager(app);
admin(app);
mods(app);
webUtils(app);
serveLeaderboards(app);
redirects(app);
charts(app);
blog(app);
socketListen(app);
serveSitemap(app);
badgesEndpoints(app);
credits(app);
handleRequestCount(app);
setupAccountEndpoints(app);
listenForPackageLists(app);
embed(app);
gameRequests(app);

serveStatic(app);

etohGen(app);
cscdGen(app);
otohGen(app);
previewGen(app);

app.get('/', async (context) => {
    const searchParams = new URL(context.req.url).searchParams;
    const searchParamsString = searchParams.toString().length > 0 ? '?' + searchParams.toString() : '';
    return context.redirect('/app/' + searchParamsString);
});

app.get('/wiki/*', async (context) => {
    const path = context.req.path.slice(6);
    if (path === '' || path === '/') return context.redirect('/app/wiki');
    return context.redirect(`https://jtoh.fandom.com/wiki/${path}`);
});

discordInteractions(app);
publishDiscordCommands().catch(() => {
    if (fs.existsSync('cache/discord-commands')) fs.rmSync('cache/discord-commands');
    logger.error('Failed to publish Discord commands.');
});

app.get('/towerstats/:game/:user', async (context) => {
    const account = await parseRobloxAccount(context);
    if (!account) return context.json({ error: 'Invalid user.' }, 400);
    return context.redirect(`https://towerstats.com/${context.req.param().game}?username=${account.name}`);
});

app.get('/api/app.webmanifest', async (context) => {
    context.res.headers.set('Content-Type', 'application/manifest+json');
    return context.body(
        JSON.stringify({
            short_name: getURLHost(),
            name: 'JToH Pro' + (isDev ? ' (Dev)' : isBeta ? ' (Beta)' : ''),
            icons: [
                {
                    src: `${getURL()}/app/assets/roblox-icon.png`,
                    sizes: '512x512',
                    type: 'image/png'
                }
            ],
            start_url: '/app/',
            display: 'standalone',
            theme_color: '#b58dffde',
            background_color: '#222222'
        })
    );
});

app.get('/api/clear-site-cache', async (context) => {
    context.res.headers.set('Clear-Site-Data', '"cache"');
    return context.json({ message: 'Success.' });
});

app.notFound((context) => {
    if (context.req.path.startsWith('/app/')) return context.redirect('/app/404');
    else return context.json({ error: 'Not found.' }, 404);
});

app.onError((error, context) => {
    logger.error(error);

    // logger.error SUCKS at logging http errors... smh
    Bun.inspect(error);

    return context.json({ error: 'Internal server error.' }, 500);
});

export default {
    port: port,
    fetch: app.fetch,
    idleTimeout: 180,
    websocket: socket as any
} satisfies Serve;

quickWebTest();

logger.info(`Git Hash: ${gitHash}`);
logger.info(`Server started. ${getURL()}`);
