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
    waitForElementByIdExpected
} from '../libs/util';

export default async function () {
    const container = await waitForElementByIdExpected('homepageGameSelectionsContainer', 'div', {
        interval: 100,
        timeout: 5000
    });
    // this is also a protection against other index pages loading this script, although that shouldn't be an issue...
    if (!container) return;

    const games = [
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
            featured: true
        }
    ];

    const containerFeatured = getElementByIdExpected('homepageGameSelectionsContainerFeatured', 'div');
    if (!containerFeatured) return;

    const idList = games.map((game) => game.id).join(',');
    const images = await (
        await fetch(`/api/util/roblox-universe-thumbnail/multi/${idList}`).catch(() => {
            createErrorPopup('Failed to load game thumbnails.', false);
            return { json: async () => ({ error: 'Failed to fetch.' }) };
        })
    ).json();

    if (images.error || !images.result) return;

    container.innerHTML = '';

    for (const game of games) {
        const gameContainer = createElement('div', {}, ['homepageGameSingleSelectionContainer']);
        const name = createElement('p', { innerText: game.name });
        const image = createElement('div');
        const open = createElement('a', { innerText: 'Get Card', href: `/app/${game.path}` });

        //image.style.backgroundImage = `url(${images.result[game.id][0]})`;
        image.style.backgroundImage = images.result[game.id].map((url: string) => `url(${url})`).join(', ');

        let currentIndex = 0;
        async function update() {
            await wait(convertTo({ seconds: 8 }, 'milliseconds'));
            currentIndex = (currentIndex + 1) % images.result[game.id].length;
            image.style.backgroundImage = `url(${images.result[game.id][currentIndex]})`;
            update();
        }

        update();

        addChild(image, [name, open]);
        addChild(gameContainer, [image]);

        if (game.featured) {
            addChild(containerFeatured, gameContainer);
            addClass(gameContainer, 'homepageGameSingleSelectionContainerFeatured');
        } else {
            addChild(container, gameContainer);
        }
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
}
