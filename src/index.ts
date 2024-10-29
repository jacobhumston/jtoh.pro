import { Hono } from 'hono';
import { GlobalFonts } from '@napi-rs/canvas';
import { statsDB } from './db';
import { startOfMonth, startOfWeek, startOfYear, parse, isAfter, isToday } from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import jtoh from './jtoh';
import discordInteractions, { publishDiscordCommands } from './discord';
import redirects from './redirects';
import serveStatic from './static';
import logger from './logger';
import fs from 'node:fs';
import webUtils from './webutils';
import serveLeaderboards from './leaderboards';
import { isDev, getURL } from './dev';
import setupLoginAuth from './loginauth';
import { rateLimiter } from 'hono-rate-limiter';
import { getTempToken } from './temptokens';
import { convert as timeConvert } from '@jacobhumston/tc.js';
import { admin } from './admin';
import { captchaManager } from './captcha';

const app = new Hono();

GlobalFonts.registerFromPath('src/web/app/assets/Poppins-Regular.ttf', 'Poppins');
GlobalFonts.registerFromPath('src/web/app/assets/Twemoji-15.1.0.ttf', 'Twemoji');

app.use(async (context, next) => {
    const host = context.req.header('host');
    if (host) {
        const parts = host.split('.');
        const link = new URL(context.req.url);
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
        limit: 10,
        standardHeaders: 'draft-6',
        keyGenerator: (context) => {
            return context.req.path;
        },
        handler: async (context) => {
            return context.json({ error: 'Rate limit exceeded. Please wait and try again.' }, 429) as any;
        },
        skip: async (context) => {
            return (
                (context.req.query('rlb-token') ?? '') === getTempToken('rlb-token') ||
                context.req.path.startsWith('/app/') ||
                context.req.path.startsWith('/ext/') ||
                isDev
            );
        }
    })
);

setupLoginAuth(app);
captchaManager(app);
admin(app);
webUtils(app);
serveLeaderboards(app);
serveStatic(app);
redirects(app);
jtoh(app);

app.get('/', async (context) => {
    return context.redirect('/app/');
});

app.get('/wiki/*', async (context) => {
    const path = context.req.path.slice(6);
    if (path === '' || path === '/') return context.redirect('/app/wiki');
    return context.redirect(`https://jtoh.fandom.com/wiki/${path}`);
});

app.get('/ext/request-count', async (context) => {
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

app.notFound((context) => {
    return context.json({ error: 'Not found.' }, 404);
});

app.onError((error, context) => {
    logger.error(error);
    return context.json({ error: 'Internal server error.' }, 500);
});

export default {
    port: 80,
    fetch: app.fetch
};

logger.info(`Server started. ${getURL()}`);
