import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { GlobalFonts } from '@napi-rs/canvas';
import { statsDB } from './db';
import { startOfMonth, startOfWeek, startOfYear, parse, isAfter } from 'date-fns';
import jtoh from './jtoh';

const app = new Hono();

GlobalFonts.registerFromPath('src/web/Poppins-Regular.ttf', 'Poppins');
GlobalFonts.registerFromPath('src/web/Twemoji-15.1.0.ttf', 'Twemoji');

app.use('/*', serveStatic({ root: './src/web/' }));

app.get('/jtohxl', async (context) => {
    return context.redirect('/app/jtohxl/');
});

app.get('/cscd', async (context) => {
    return context.redirect('/app/cscd/');
});

jtoh(app);

app.get('/', async (context) => {
    return context.redirect('/app/');
});

app.get('/ext/request-count', async (context) => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const startOfCurrentYear = startOfYear(now);

    let monthCount = 0;
    let weekCount = 0;
    let yearCount = 0;
    let totalCount = 0;

    // @ts-ignore-next-line
    for await (const [key, value] of statsDB.iterator()) {
        const date = parse(key, 'MM-dd-yyyy', new Date());
        if (isAfter(date, startOfCurrentMonth)) {
            monthCount += value;
        }
        if (isAfter(date, startOfCurrentWeek)) {
            weekCount += value;
        }
        if (isAfter(date, startOfCurrentYear)) {
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

app.notFound((context) => {
    return context.json({ error: 'Not found.' }, 404);
});

export default {
    port: 80,
    fetch: app.fetch
};
