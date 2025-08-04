import { Hono } from 'hono';
import { getSignedInRobloxUser, isSignedInAdmin } from './login-auth';
import { getReferralCodeDB, referralsDB } from './db';
import { isAfter, isToday, parse, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { UTCDate } from '@date-fns/utc';

export default function setupRefs(app: Hono) {
    app.get('/api/refs/list', async (context) => {
        const isAdmin = await isSignedInAdmin(context);
        if (!isAdmin) return context.json({ error: 'Unauthorized' }, 401);
        return context.json({
            codes: (await referralsDB.get('codes')) ?? []
        });
    });

    app.get('/api/refs/viewable', async (context) => {
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Unauthorized' }, 401);
        const allCodes = (await referralsDB.get('codes')) ?? [];
        const codes = (await referralsDB.get(`_${user.id}`)) ?? [];
        return context.json({
            codes: allCodes.filter((code: string) => codes.includes(code))
        });
    });

    app.get('/api/refs/stats/:code', async (context) => {
        const code = context.req.param('code').toLowerCase();
        if (!code) return context.json({ error: 'Code is required' }, 400);
        const user = await getSignedInRobloxUser(context);
        if (!user) return context.json({ error: 'Unauthorized' }, 401);
        const isAdmin = await isSignedInAdmin(context);

        const allCodes = (await referralsDB.get('codes')) ?? [];
        const viewableCodes = (await referralsDB.get(`_${user.id}`)) ?? [];

        if (!allCodes.includes(code)) return context.json({ error: 'Code not found' }, 404);
        if (!isAdmin && !viewableCodes.includes(code)) {
            return context.json({ error: 'Unauthorized to view this code' }, 401);
        }

        const data: Array<{ date: string; views: number }> = [];
        const db = getReferralCodeDB(code);

        let todayCount = 0;
        let monthCount = 0;
        let weekCount = 0;
        let yearCount = 0;
        let totalCount = 0;
        const now = new UTCDate();
        const startOfCurrentMonth = startOfMonth(now);
        const startOfCurrentWeek = startOfWeek(now);
        const startOfCurrentYear = startOfYear(now);

        // @ts-expect-error
        for await (const [key, value] of db.iterator()) {
            const date = parse(key, 'MM-dd-yyyy', new UTCDate());
            if (isToday(date)) todayCount += value;
            if (isAfter(date, startOfCurrentMonth) || isToday(date)) monthCount += value;
            if (isAfter(date, startOfCurrentWeek) || isToday(date)) weekCount += value;
            if (isAfter(date, startOfCurrentYear) || isToday(date)) yearCount += value;
            totalCount += value;

            data.push({ date: date.toISOString(), views: value });
        }

        return context.json({
            code: code,
            data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            stats: {
                today: todayCount,
                week: weekCount,
                month: monthCount,
                year: yearCount,
                total: totalCount
            }
        });
    });
}
