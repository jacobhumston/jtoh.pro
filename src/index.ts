import { Hono } from 'hono';
import { GlobalFonts } from '@napi-rs/canvas';
import { statsDB } from './db';
import { startOfMonth, startOfWeek, startOfYear, parse, isAfter, isToday } from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import jtoh from './gens/etoh';
import discordInteractions, { publishDiscordCommands } from './discord';
import redirects from './redirects';
import serveStatic from './static';
import logger from './logger';
import fs from 'node:fs';
import webUtils from './webutils';
import serveLeaderboards from './leaderboards';
import { isDev, getURL, port, getURLHost, isBeta } from './dev';
import setupLoginAuth from './loginauth';
import { rateLimiter } from 'hono-rate-limiter';
import { getTempToken } from './temptokens';
import { convert as timeConvert } from '@jacobhumston/tc.js';
import { admin } from './admin';
import { captchaManager } from './captcha';
import { charts } from './chart';
import { parseRobloxAccount } from './loginauth';
import { quickWebTest } from './quickwebtest';
import { blog } from './blog';
import type { Serve } from 'bun';
import { socket, socketListen } from './socket';
import { compress } from 'hono-compress';
import { cors } from 'hono/cors';
import { serveSitemap } from './sitemap';
import { getConnInfo } from 'hono/bun';
import { csrf } from 'hono/csrf';
import { secureHeaders } from 'hono/secure-headers';
import { badgesEndpoints } from './roblox-badges';
import credits from './credits';
import { serveJS } from './js';

if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
for (const file of fs.readdirSync('./temp')) {
    try {
        fs.rmSync(`./temp/${file}`);
    } catch {
        logger.warn(`Failed to delete temp file: ${file}`);
    }
}

const app = new Hono();

GlobalFonts.registerFromPath('src/web/app/assets/Poppins-Regular.ttf', 'Poppins');
GlobalFonts.registerFromPath('src/web/app/assets/Twemoji-15.1.0.ttf', 'Twemoji');
GlobalFonts.registerFromPath('src/web/app/assets/MaterialSymbolsRounded.woff2', 'MaterialSymbolsRounded');

app.use(
    cors({
        origin: getURL(),
        credentials: false,
        allowMethods: ['GET', 'POST']
    })
);

app.use(
    csrf({
        origin: getURLHost()
    })
);

app.use(secureHeaders());

app.use(compress());

app.use(async (context, next) => {
    const host = context.req.header('host');
    if (host) {
        const parts = host.split('.');
        let link: URL;
        try {
            link = new URL(context.req.url);
        } catch {
            return context.json({ error: 'Invalid host.' }, 400);
        }
        if (parts.length > 1) {
            if (parts[0] === 'beta' && getURL() === 'https://beta.jtoh.pro') return await next();
            return context.redirect(getURL() + link.pathname + link.search);
        }
    } else {
        return context.json({ error: 'Invalid host.' }, 400);
    }
    await next();
});

app.use(
    rateLimiter({
        windowMs: timeConvert({ minutes: 1 }).milliseconds,
        limit: 120,
        standardHeaders: 'draft-6',
        keyGenerator: (context) => {
            return `${isDev ? getConnInfo(context).remote.address : context.req.header('CF-Connecting-IP')}::${context.req.path}`;
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

app.get('/app/templates/*', async (context) => {
    return context.json({ error: 'Not found.' }, 404);
});

setupLoginAuth(app);
captchaManager(app);
admin(app);
webUtils(app);
serveLeaderboards(app);
serveStatic(app);
redirects(app);
charts(app);
blog(app);
socketListen(app);
serveSitemap(app);
jtoh(app);
badgesEndpoints(app);
credits(app);
serveJS(app);

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

app.get('/api/request-count', async (context) => {
    const now = new UTCDate();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfCurrentWeek = startOfWeek(now);
    const startOfCurrentYear = startOfYear(now);

    let monthCount = 0;
    let weekCount = 0;
    let yearCount = 0;
    let totalCount = 0;

    // @ts-ignore-next-line
    for await (const [key, value] of statsDB.iterator()) {
        const date = parse(key, 'MM-dd-yyyy', new UTCDate());
        if (isAfter(date, startOfCurrentMonth) || isToday(date)) {
            monthCount += value;
        }
        if (isAfter(date, startOfCurrentWeek) || isToday(date)) {
            weekCount += value;
        }
        if (isAfter(date, startOfCurrentYear) || isToday(date)) {
            yearCount += value;
        }
        totalCount += value;
    }

    return context.json({
        month: monthCount,
        week: weekCount,
        year: yearCount,
        total: totalCount
    });
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
    return context.json({
        short_name: getURLHost(),
        name: 'JToH Pro' + (isDev ? ' (Dev)' : isBeta ? ' (Beta)' : ''),
        icons: [
            {
                src: '/app/assets/roblox-icon.png',
                sizes: '512x512',
                type: 'image/png'
            }
        ],
        start_url: '/app/',
        display: 'standalone',
        theme_color: '#b58dffde',
        background_color: '#222222'
    });
});

app.notFound((context) => {
    if (context.req.path.startsWith('/app/')) return context.redirect('/app/404');
    else return context.json({ error: 'Not found.' }, 404);
});

app.onError((error, context) => {
    logger.error(error);
    return context.json({ error: 'Internal server error.' }, 500);
});

export default {
    port: port,
    fetch: app.fetch,
    idleTimeout: 180,
    websocket: socket as any
} satisfies Serve;

quickWebTest();

logger.info(`Server started. ${getURL()}`);
