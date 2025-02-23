import { numberFormatter } from '../libs/formatters';
import { waitForElementById } from '../libs/util';

export async function updateRequestStats() {
    const week = await waitForElementById('requestStatsWeek', { timeout: 10000 }),
        month = await waitForElementById('requestStatsMonth', { timeout: 10000 }),
        year = await waitForElementById('requestStatsYear', { timeout: 10000 }),
        total = await waitForElementById('requestStatsTotal', { timeout: 10000 });

    if (week && month && year && total) {
        const response = await fetch('/api/request-count').then((res) => res.json());
        week.textContent = numberFormatter.format(response.week);
        month.textContent = numberFormatter.format(response.month);
        year.textContent = numberFormatter.format(response.year);
        total.textContent = numberFormatter.format(response.total);
    } else {
        console.error('Failed to update request stats, element was missing.');
    }
}
