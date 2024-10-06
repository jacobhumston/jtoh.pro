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

const app = new Hono();

GlobalFonts.registerFromPath('src/web/app/assets/Poppins-Regular.ttf', 'Poppins');
GlobalFonts.registerFromPath('src/web/app/assets/Twemoji-15.1.0.ttf', 'Twemoji');

webUtils(app);
serveLeaderboards(app);
serveStatic(app);
redirects(app);
jtoh(app);

app.get('/', async (context) => {
    return context.redirect('/app/');
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

logger.info('Server started.');
