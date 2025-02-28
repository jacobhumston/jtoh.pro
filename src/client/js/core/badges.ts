import { getWebToken } from '../libs/security';
import {
    addChild,
    addClass,
    createElement,
    getElementById,
    getElementByIdExpected,
    getWebIconHTML,
    getWebsocketURL,
    waitForPageLoad
} from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const loadBadges = getElementByIdExpected('loadBadges', 'button');
    const loadBadgesUsername = getElementByIdExpected('loadBadgesUsername', 'input');
    const badgeContainer = getElementById('badgesContainer');
    const badgeStatBar = getElementById('badgeStatBar');

    if (!loadBadges || !loadBadgesUsername || !badgeContainer || !badgeStatBar) return;

    loadBadges.onclick = async () => {
        const timeStarted = Date.now();

        loadBadges.disabled = true;
        badgeContainer.style.display = 'none';

        const resultId = await fetch(
            `/api/badges/check?username=${loadBadgesUsername.value}&captcha=${await getWebToken()}`
        )
            .then((response) => response.json())
            .then((data) => data.resultId)
            .catch((err) => {
                console.error(err);
                return null;
            });

        if (!resultId) {
            alert('Failed to fetch data.');
            return;
        }

        loadBadges.disabled = true;
        loadBadgesUsername.value = '';

        const progressBar = getElementById('progressBar');
        const progressBarFill = getElementById('progressBarFill');

        if (!progressBar || !progressBarFill) return;

        progressBar.style.display = 'block';
        progressBarFill.style.width = '0%';
        progressBarFill.innerHTML = '0% <img>';

        const socket = new WebSocket(`${getWebsocketURL('badge-check-progress')}&resultId=${resultId}`);

        socket.addEventListener('message', (data) => {
            //console.log('MESSAGE', data.data);
            const parsed = JSON.parse(data.data);
            if (!parsed.progress) return;
            progressBarFill.style.width = `${parsed.progress}%`;
            progressBarFill.innerHTML = `${Math.floor(parsed.progress)}% <img>`;

            let timePassed = ((Date.now() - timeStarted) / 1000).toFixed(2);

            badgeStatBar.style.display = 'block';
            badgeStatBar.innerHTML = `${getWebIconHTML('award_star')} <b>${parsed.completed}</b>/<b>${parsed.total}</b> — ${getWebIconHTML('wifi')} <b>${parsed.requests.success}</b>/<b>${parsed.requests.retry}</b> — ${getWebIconHTML('timer')} <b>${timePassed}s</b>`;
        });

        socket.addEventListener('close', async () => {
            progressBarFill.innerText = 'Badges loaded! Fetching result from the server...';

            //console.log('CLOSE');
            const result = await fetch(`/api/badges/check/${resultId}`)
                .then((response) => response.json())
                .catch(() => null);
            //console.log('RESULT', result);
            if (!result) {
                alert('Websocket closed before the badge data was ready. Please refresh the page and try again.');
                return;
            }

            progressBarFill.innerText = 'Badges loaded! Loading badge details...';
            const result2 = await fetch(`/api/badges/all?captcha=${await getWebToken()}`).then((response) =>
                response.json()
            );

            if (result2.error) {
                alert('Failed to fetch badge data.');
                return;
            }

            badgeContainer.style.display = 'block';
            for (const [_, badges] of Object.entries(result2.games) as [string, any[]][]) {
                if (badges.length === 0) continue;

                const game = badges[0].awardingUniverse;
                //const gameId = game.id;
                const gameName = game.name;

                const gameContainer = createElement('div');
                addClass(gameContainer, 'badgeGameContainer');

                const gameTitle = createElement('h2');
                gameTitle.innerText = gameName;
                addChild(gameContainer, gameTitle);

                const gameBadges = createElement('div');
                addClass(gameBadges, 'badgeGameBadges');
                addChild(gameContainer, gameBadges);

                const viewBadgesButton = createElement('button');
                viewBadgesButton.innerText = 'View Badges';
                viewBadgesButton.type = 'button';
                viewBadgesButton.onclick = () => {
                    viewBadgesButton.remove();

                    for (const badge of badges) {
                        const badgeOwnershipDetails = result.find((x: any) => x.id === badge.id);

                        const badgeElement = createElement('div');
                        addClass(badgeElement, 'badgeElement');

                        const name = createElement('span');
                        name.innerText = (badge.name ?? 'No name available.')
                            .replaceAll('\r', '')
                            .replaceAll('\n', ' ');
                        addClass(name, 'badgeName');

                        const description = createElement('span');
                        description.innerText = (badge.description ?? 'No description available.')
                            .replaceAll('\r', '')
                            .replaceAll('\n', ' ');
                        addClass(description, 'badgeDescription');
                        if (badge.description === null) addClass(description, 'badgeNoDescription');

                        const awardedOn = createElement('span');
                        if (badgeOwnershipDetails.owned) {
                            awardedOn.innerText = `Awarded on ${new Date(badgeOwnershipDetails.awarded).toLocaleString()}`;
                            addClass(badgeElement, 'badgeOwned');
                        } else {
                            awardedOn.innerText = 'Not awarded.';
                            addClass(badgeElement, 'badgeNotOwned');
                        }
                        addClass(awardedOn, 'badgeAwardedOn');

                        awardedOn.innerHTML = `${awardedOn.innerText}<br><a target="_blank" href="https://www.roblox.com/badges/${badge.id}">View on Roblox</a>`;

                        const image = createElement('img');
                        image.alt = badge.name;
                        addClass(image, 'badgeImage');

                        new IntersectionObserver(
                            (entries, observer) => {
                                entries.forEach((entry) => {
                                    if (entry.isIntersecting) {
                                        image.src = badge.imageUrl;
                                        observer.unobserve(image);
                                    }
                                });
                            },
                            { threshold: 0.1 }
                        ).observe(image);

                        image.onerror = () => {
                            if (image.src !== '/app/assets/unknown-badge.png') {
                                image.src = '/app/assets/unknown-badge.png';
                            }
                        };

                        const badgeDetails = createElement('div');
                        addClass(badgeDetails, 'badgeDetails');
                        addChild(badgeElement, image);
                        addChild(badgeDetails, name);
                        addChild(badgeDetails, description);
                        addChild(badgeDetails, awardedOn);
                        addChild(badgeElement, badgeDetails);
                        addChild(gameBadges, badgeElement);
                    }
                };

                addChild(gameBadges, viewBadgesButton);
                addChild(badgeContainer, gameContainer);
            }

            // progressBarFill.innerText = `Done! Loaded in ${((Date.now() - timeStarted) / 1000).toFixed(2)}s`;

            progressBar.style.display = 'none';
            loadBadges.disabled = false;
            //badgeStatBar.style.display = 'none';
        });
    };
}
