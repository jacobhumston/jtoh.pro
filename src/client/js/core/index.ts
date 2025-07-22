import { convertTo } from '@jacobhumston/tc.js';
import { createErrorPopup } from '../libs/quick-elements';
import {
    addChild,
    addClass,
    createElement,
    getElementByIdExpected,
    getWebIconHTML,
    insertChild,
    wait,
    waitForElementById,
    waitForElementByIdExpected
} from '../libs/util';
import { numberFormatter } from '../libs/formatters';

export default async function () {
    const container = await waitForElementByIdExpected('homepageGameSelectionsContainer', 'div', {
        interval: 100,
        timeout: 5000
    });
    // this is also a protection against other index pages loading this script, although that shouldn't be an issue...
    if (!container) return;

    const games: Array<{ id: string; path: string; name: string; featured?: boolean; partner?: boolean }> = [
        {
            id: '3264581003',
            path: 'etoh',
            name: 'Eternal Towers of Hell'
        },
        {
            id: '3762953501',
            path: 'cscd',
            name: "Caleb's Soul Crushing Domain"
        },
        {
            id: '7500221064',
            path: 'otoh',
            name: 'OToH',
            partner: true
        }
    ];

    const requestCounts = await (await fetch('/api/request-count')).json();
    games.sort(
        (a, b) =>
            requestCounts['_popularity'].findIndex((e: any) => e === a.path) -
            requestCounts['_popularity'].findIndex((e: any) => e === b.path)
    );

    const containerFeatured = getElementByIdExpected('homepageGameSelectionsContainerFeatured', 'div');
    if (!containerFeatured) return;

    const idList = games.map((game) => game.id).join(',');

    const images = fetch(`/api/util/roblox-universe-thumbnail/multi/${idList}`).catch(() => {
        createErrorPopup('Failed to load game thumbnails.', false);
        return { json: async () => ({ error: 'Failed to fetch.' }) };
    });

    const imageJSON: any = images
        .then((response) => response.json())
        .catch(() => {
            createErrorPopup('Failed to parse game thumbnails.', false);
            return { error: 'Failed to parse.' };
        });

    //if (images.error || !images.result) return;

    container.innerHTML = '';

    for (const game of games) {
        const gameContainer = createElement('div', {}, ['homepageGameSingleSelectionContainer']);
        const name = createElement('p', { innerText: game.name });
        const image = createElement('div');
        const open = createElement('a', { innerText: 'Get Card', href: `/app/${game.path}` });
        const stat = createElement('span', {
            innerHTML: `${getWebIconHTML('bar_chart')}${numberFormatter.format(requestCounts[game.path]?.today || 0)}`,
            className: 'statCount'
        });

        addChild(image, [name, stat, open]);
        addChild(gameContainer, [image]);

        if (game.partner) {
            const partnerSpan = createElement('span', { innerText: 'Partner', className: 'partnerLabel' });
            insertChild(name, 'afterbegin', partnerSpan);
        }

        if (game.featured) {
            addChild(containerFeatured, gameContainer);
            addClass(gameContainer, 'homepageGameSingleSelectionContainerFeatured');
        } else {
            addChild(container, gameContainer);
        }

        //image.style.backgroundImage = `url(${images.result[game.id][0]})`;
        new Promise(async () => {
            const imageData = await imageJSON;
            if (imageData.error || !imageData.result) return;
            image.style.backgroundImage = imageData.result[game.id].map((url: string) => `url(${url})`).join(', ');

            let currentIndex = 0;
            async function update() {
                await wait(convertTo({ seconds: 8 }, 'milliseconds'));
                currentIndex = (currentIndex + 1) % imageData.result[game.id].length;
                image.style.backgroundImage = `url(${imageData.result[game.id][currentIndex]})`;
                update();
            }

            update();
        });
    }

    if (containerFeatured.children.length > 0) {
        containerFeatured.style.display = 'block';
        insertChild(
            containerFeatured,
            'afterbegin',
            createElement('p', {
                innerHTML: getWebIconHTML('star') + 'Featured Game',
                className: 'homepageGameSelectionsContainerFeaturedTitle'
            })
        );
    }

    const cardRequestChartImage = getElementByIdExpected('cardRequestChartImage', 'img');
    if (cardRequestChartImage)
        cardRequestChartImage.src = `/api/charts/card-requests?width=500&height=250&nocache=${Date.now()}`;

    const today = await waitForElementById('requestStatsToday', { timeout: 10000 }),
        week = await waitForElementById('requestStatsWeek', { timeout: 10000 }),
        month = await waitForElementById('requestStatsMonth', { timeout: 10000 }),
        year = await waitForElementById('requestStatsYear', { timeout: 10000 }),
        total = await waitForElementById('requestStatsTotal', { timeout: 10000 });

    if (today && week && month && year && total) {
        const response = await fetch(`/api/request-count`)
            .then((res) => res.json())
            .catch(() => null);

        today.textContent = numberFormatter.format(response['_totals'].today);
        week.textContent = numberFormatter.format(response['_totals'].week);
        month.textContent = numberFormatter.format(response['_totals'].month);
        year.textContent = numberFormatter.format(response['_totals'].year);
        total.textContent = numberFormatter.format(response['_totals'].total);
    }
}
