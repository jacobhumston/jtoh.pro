import { getElementById } from '../libs/util.ts';
import { wait } from '../libs/util.ts';

export async function updateRequestStats() {
    const week = getElementById('requestStatsWeek'),
        month = getElementById('requestStatsMonth'),
        year = getElementById('requestStatsYear'),
        total = getElementById('requestStatsTotal');

    if (week && month && year && total) {
        const response = await fetch('/api/request-count').then((res) => res.json());
        week.textContent = response.week;
        month.textContent = response.month;
        year.textContent = response.year;
        total.textContent = response.total;
    } else {
        await wait(100);
        updateRequestStats();
    }
}
