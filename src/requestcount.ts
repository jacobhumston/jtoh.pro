import type { Hono } from 'hono';
import { statsDB } from './db';
import { startOfMonth, startOfWeek, startOfYear, parse, isAfter, isToday } from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import { gameNamesArray, type gameNames } from './shared/gamelist';

export function handleRequestCount(app: Hono) {
    app.get('/api/request-count/:game', async (context) => {
        if (!gameNamesArray.includes(context.req.param('game') as any))
            return context.json({ error: 'Invalid game.' }, 400);

        const game = context.req.param('game') as gameNames;

        const now = new UTCDate();
        const startOfCurrentMonth = startOfMonth(now);
        const startOfCurrentWeek = startOfWeek(now);
        const startOfCurrentYear = startOfYear(now);

        let monthCount = 0;
        let weekCount = 0;
        let yearCount = 0;
        let totalCount = 0;

        // @ts-ignore-next-line
        for await (const [key, value] of statsDB[game].iterator()) {
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
}
