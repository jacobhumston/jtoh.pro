import { waitForElementById } from '../libs/util.ts';

export async function updateRequestStats() {
    const week = await waitForElementById('requestStatsWeek', { timeout: 10000 }),
        month = await waitForElementById('requestStatsMonth', { timeout: 10000 }),
        year = await waitForElementById('requestStatsYear', { timeout: 10000 }),
        total = await waitForElementById('requestStatsTotal', { timeout: 10000 });

    if (week && month && year && total) {
        const response = await fetch('/api/request-count').then((res) => res.json());
        week.textContent = response.week;
        month.textContent = response.month;
        year.textContent = response.year;
        total.textContent = response.total;
    } else {
        console.error('Failed to update request stats, element was missing.');
    }
}
