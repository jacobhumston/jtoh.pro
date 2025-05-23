import type { gameNames } from '../../../shared/gamelist';
import { numberFormatter } from '../libs/formatters';
import { createErrorPopup } from '../libs/quick-elements';
import { waitForElementById } from '../libs/util';

/**
 * Update the card request counts.
 * @param game The game to update the request counts for.
 */
export async function updateRequestStats(game: gameNames) {
    const today = await waitForElementById('requestStatsToday', { timeout: 10000 }),
        week = await waitForElementById('requestStatsWeek', { timeout: 10000 }),
        month = await waitForElementById('requestStatsMonth', { timeout: 10000 }),
        year = await waitForElementById('requestStatsYear', { timeout: 10000 }),
        total = await waitForElementById('requestStatsTotal', { timeout: 10000 });

    if (today && week && month && year && total) {
        const response = await fetch(`/api/request-count/${game}`)
            .then((res) => res.json())
            .catch(() => ({
                today: 0,
                week: 0,
                month: 0,
                year: 0,
                total: 0
            }));

        today.textContent = numberFormatter.format(response.today);
        week.textContent = numberFormatter.format(response.week);
        month.textContent = numberFormatter.format(response.month);
        year.textContent = numberFormatter.format(response.year);
        total.textContent = numberFormatter.format(response.total);
    } else {
        createErrorPopup('Failed to update request stats, element was missing.', 4000);
        console.error('Failed to update request stats, element was missing.');
    }
}

/**
 * Update the card request chart image.
 */
export async function updateRequestChart(game: gameNames) {
    const chart = (await waitForElementById('cardRequestChartImage', { timeout: 10000 })) as HTMLImageElement;

    if (chart) {
        chart.src = `/api/charts/card-requests/${game}?width=500&height=250`;
    } else {
        createErrorPopup('Failed to update request chart, element was missing.', 4000);
        console.error('Failed to update request chart, element was missing.');
    }
}
