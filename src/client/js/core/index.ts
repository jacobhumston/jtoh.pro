import { createErrorPopup } from '../libs/quickElements';
import { addChild, createElement, waitForElementByIdExpected } from '../libs/util';

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
        }
    ];

    const idList = games.map((game) => game.id).join(',');
    const images = await (
        await fetch(`/api/util/roblox-universe-thumbnail/${idList}`).catch(() => {
            createErrorPopup('Failed to load game thumbnails.', false);
            return { json: async () => ({ error: 'Failed to fetch.' }) };
        })
    ).json();

    if (images.error || !images.result) return;

    for (const game of games) {
        const gameContainer = createElement('div', {}, ['homepageGameSingleSelectionContainer']);
        const name = createElement('p', { innerText: game.name });
        const image = createElement('div');
        const open = createElement('a', { innerText: 'Get Card', href: `/app/${game.path}` });

        image.style.backgroundImage = `url('${images.result[game.id]}')`;

        addChild(image, [name, open]);
        addChild(gameContainer, [image]);
        addChild(container, gameContainer);
    }
}
