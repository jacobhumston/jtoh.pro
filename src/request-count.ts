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

        let todayCount = 0;
        let monthCount = 0;
        let weekCount = 0;
        let yearCount = 0;
        let totalCount = 0;

        // @ts-ignore-next-line
        for await (const [key, value] of statsDB[game].iterator()) {
            const date = parse(key, 'MM-dd-yyyy', new UTCDate());

            if (isToday(date)) todayCount += value;

            if (isAfter(date, startOfCurrentMonth) || isToday(date)) monthCount += value;

            if (isAfter(date, startOfCurrentWeek) || isToday(date)) weekCount += value;

            if (isAfter(date, startOfCurrentYear) || isToday(date)) yearCount += value;

            totalCount += value;
        }

        return context.json({
            today: todayCount,
            month: monthCount,
            week: weekCount,
            year: yearCount,
            total: totalCount
        });
    });

    app.get('/api/request-count', async (context) => {
        const data: any = {};
        const popular: any = [];

        for (const game of gameNamesArray) {
            const now = new UTCDate();
            const startOfCurrentMonth = startOfMonth(now);
            const startOfCurrentWeek = startOfWeek(now);
            const startOfCurrentYear = startOfYear(now);

            let todayCount = 0;
            let monthCount = 0;
            let weekCount = 0;
            let yearCount = 0;
            let totalCount = 0;

            // @ts-ignore-next-line
            for await (const [key, value] of statsDB[game].iterator()) {
                const date = parse(key, 'MM-dd-yyyy', new UTCDate());

                if (isToday(date)) todayCount += value;

                if (isAfter(date, startOfCurrentMonth) || isToday(date)) monthCount += value;

                if (isAfter(date, startOfCurrentWeek) || isToday(date)) weekCount += value;

                if (isAfter(date, startOfCurrentYear) || isToday(date)) yearCount += value;

                totalCount += value;
            }

            data[game] = {
                today: todayCount,
                month: monthCount,
                week: weekCount,
                year: yearCount,
                total: totalCount
            };

            popular.push({
                game,
                today: todayCount
            });
        }

        popular.sort((a: any, b: any) => b.today - a.today);
        data['_totals'] = {
            today: Object.values(data).reduce((sum: number, item: any) => sum + item.today, 0),
            month: Object.values(data).reduce((sum: number, item: any) => sum + item.month, 0),
            week: Object.values(data).reduce((sum: number, item: any) => sum + item.week, 0),
            year: Object.values(data).reduce((sum: number, item: any) => sum + item.year, 0),
            total: Object.values(data).reduce((sum: number, item: any) => sum + item.total, 0)
        };
        data['_popularity'] = popular.map((item: any) => item.game);

        return context.json(data);
    });
}
