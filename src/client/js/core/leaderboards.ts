import { capitalizedGameNamesArray, fullNamesArray } from '../../../shared/gamelist';
import { getLoggedInUser } from '../libs/auth';
import { getWebToken } from '../libs/security';
import {
    addChild,
    addClass,
    createElement,
    getElementById,
    getWebIconHTML,
    waitForPageLoad,
    waitForWindowLoad
} from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const container = getElementById('leaderboardDivContainer');
    if (!container) return;

    const url = new URL(window.location.href);
    const params = url.searchParams;
    const includeJacob = params.get('includeJacob') === 'true';
    const type = params.get('type') ?? 'skill-points';
    const other = params.get('other') ?? 'etoh';
    const page = parseInt(params.get('page') ?? '1') ?? 1;
    const formatter = new Intl.NumberFormat();
    const description = getElementById('leaderboardCurrentDescription') as HTMLDivElement;
    const selectionContainer = getElementById('leaderboardSelectionContainer') as HTMLDivElement;
    const leaderboards = [
        {
            name: 'Card Requests',
            type: 'card-requests',
            other: capitalizedGameNamesArray,
            otherLabels: fullNamesArray,
            description: 'Leaderboard for the most amount of cards requested for a specific user.'
        },
        {
            name: 'Skill Points',
            type: 'skill-points',
            other: capitalizedGameNamesArray,
            otherLabels: fullNamesArray,
            description: `Leaderboard of the user's with the most amount of skill points. \n${getWebIconHTML('info')} Skill points are calculated via completed towers amongst other factors.`
        }
    ];
    const fixOther = (string: string) => string.toLowerCase().replaceAll(' ', '');
    const loggedInUser = await getLoggedInUser();

    leaderboards.forEach((thisType) => {
        if (thisType.type === 'card-requests' && loggedInUser.admin === false) return;
        const typeContainer = createElement('div');
        addClass(typeContainer, 'leaderboardSelectionTypeContainer');
        const name = createElement('span');
        name.innerHTML = `<b>${thisType.name}</b>`;
        addClass(name, 'leaderboardSelectionType');
        addChild(typeContainer, name);
        addChild(typeContainer, createElement('br'));
        addChild(selectionContainer, typeContainer);
        thisType.other.forEach((thisOther, index) => {
            const button = createElement('button');
            button.innerText = thisType.otherLabels[index];
            addClass(button, 'leaderboardSelectionButton');
            button.onclick = () => {
                window.location.href = `/app/leaderboards?type=${thisType.type}&other=${fixOther(thisOther)}&page=1${includeJacob ? '&includeJacob=true' : ''}`;
            };
            button.type = 'button';
            if (thisType.type === type && fixOther(thisOther) === other) {
                addClass(button, 'leaderboardSelectionButtonSelected');
                button.disabled = true;

                waitForWindowLoad().then(() => {
                    button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            }
            addChild(typeContainer, button);
            if (index - (1 % 3) === 1) addChild(typeContainer, createElement('br'));
        });
    });

    const typeObject = leaderboards.find((x) => x.type === type);
    if (!typeObject) {
        description.innerHTML = `<p>Invalid leaderboard type.</p>`;
        return;
    }

    description.innerHTML =
        `<p>${getWebIconHTML('trophy')} <b>${typeObject.name}</b> (${other}) - ${typeObject.description}</p>`.replaceAll(
            '\n',
            '<br>'
        );

    if (isNaN(page) || page < 1) {
        description.innerHTML = `<p>Invalid page number.</p>`;
        return;
    }

    const otherValue = typeObject.other.find((x) => fixOther(x) === other);
    if (!otherValue) {
        description.innerHTML = `<p>Invalid other parameter.</p>`;
        return;
    }

    loadLeaderboard(container, type, other);

    async function loadLeaderboard(div: any, type: any, other: any) {
        const token = await getWebToken();

        div.innerHTML = 'Loading... Please wait.';
        fetch(`/api/leaderboards/${type}/${other}?includeJacob=${includeJacob}&page=${page}&captcha=${token}`)
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    div.innerHTML = `<p>Something went wrong.</p>`;
                    console.log(response.error);
                    return;
                }
                div.innerHTML = 'Loading...';

                if (response.result.length === 0) {
                    div.innerHTML = '<p>No data available for this leaderboard.</p>';
                    return;
                }

                div.innerHTML = '';

                if (response.total.pages > 0) {
                    const userCount = createElement('span');
                    userCount.innerHTML = `${getWebIconHTML('group')} <b>${formatter.format(response.total.users)}</b> users in this leaderboard.`;
                    addClass(userCount, 'leaderboardUserCount');
                    addChild(div, userCount);

                    if (response.me) {
                        const myRank = createElement('span');
                        myRank.innerHTML = `${getWebIconHTML('person')} You are ranked <b>#${formatter.format(response.me.rank)}</b>.`;
                        addClass(myRank, 'leaderboardMyRank');
                        addChild(div, myRank);
                    }

                    const pagination = createElement('div');
                    addClass(pagination, 'leaderboardPagination');
                    addChild(div, pagination);

                    const previous = createElement('button');
                    previous.innerText = 'Previous';
                    addClass(previous, 'leaderboardPaginationButton');
                    previous.type = 'button';
                    if (page > 1) {
                        previous.onclick = () => {
                            window.location.href = `/app/leaderboards?type=${type}&other=${other}&page=${page - 1}${
                                includeJacob ? '&includeJacob=true' : ''
                            }`;
                        };
                    } else {
                        previous.disabled = true;
                    }
                    addChild(pagination, previous);

                    const pageText = createElement('span');
                    pageText.innerText = `Page ${page}/${response.total.pages}`;
                    addClass(pageText, 'leaderboardPaginationText');
                    addChild(pagination, pageText);

                    const next = createElement('button');
                    next.innerText = 'Next';
                    addClass(next, 'leaderboardPaginationButton');
                    next.type = 'button';
                    if (page < response.total.pages) {
                        next.onclick = () => {
                            window.location.href = `/app/leaderboards?type=${type}&other=${other}&page=${page + 1}${
                                includeJacob ? '&includeJacob=true' : ''
                            }`;
                        };
                    } else {
                        next.disabled = true;
                    }
                    addChild(pagination, next);
                }

                for (const data of response.result) {
                    const user = data.user;
                    const count = data.count;

                    const row = createElement('div');
                    addClass(row, 'leaderboardRow');

                    const rank = createElement('span');
                    rank.innerText = `#${formatter.format(data.rank)}`;
                    addClass(rank, 'leaderboardRank');
                    addChild(div, rank);

                    const iconContainer = createElement('div');
                    addClass(iconContainer, 'leaderboardIconContainer');
                    addChild(row, iconContainer);

                    const icon = createElement('img');
                    icon.onerror = () => {
                        if (icon.src !== '/app/assets/default-roblox-profile.png') {
                            icon.src = '/app/assets/default-roblox-profile.png';
                        }
                    };

                    function setImageSource(icon: any) {
                        if (user.thumbnail === '') {
                            icon.src = '/app/assets/default-roblox-profile.png';
                        } else {
                            /*
                            if (data.rank < 4) {
                                icon.src = user.thumbnail;
                                fetch(`/api/util/user-roblox-thumbnails/${user.id}`)
                                    .then(async (response) => {
                                        icon.src = (await response.json()).bust;
                                    })
                                    .catch(() => {});
                            } else {
                                icon.src = user.thumbnail;
                            }
                            */
                            icon.src = user.thumbnail;
                        }
                    }

                    const iconObserver = new IntersectionObserver(
                        (entries, observer) => {
                            entries.forEach((entry) => {
                                if (entry.isIntersecting) {
                                    setImageSource(icon);
                                    observer.unobserve(icon);
                                }
                            });
                        },
                        { threshold: 0.1 }
                    );
                    iconObserver.observe(icon);

                    icon.alt = 'User Icon';
                    addClass(icon, 'leaderboardIcon');
                    addChild(iconContainer, icon);

                    const name = createElement('span');
                    name.innerText = user.displayName;
                    addClass(name, 'leaderboardName');
                    addChild(name, createElement('br'));
                    addChild(row, name);

                    const fullName = createElement('span');
                    fullName.innerText = `@${user.name}`;
                    addClass(fullName, 'leaderboardFullName');
                    addChild(name, fullName);

                    const countElement = createElement('span');
                    countElement.innerText = formatter.format(count);
                    if (countElement.innerText.includes('.')) {
                        const decimal = countElement.innerText.split('.')[1];
                        countElement.innerText = countElement.innerText.split('.')[0];
                        const decimalElement = createElement('span');
                        decimalElement.innerText = `.${decimal}`;
                        addClass(decimalElement, 'leaderboardDecimal');
                        addChild(countElement, decimalElement);
                    }
                    addClass(countElement, 'leaderboardCount');
                    addChild(row, countElement);
                    addChild(div, row);

                    if (data.rank === 1) {
                        addClass(iconContainer, 'leaderboardIconContainerFirst');
                        addClass(name, 'leaderboardNameFirst');
                        addClass(row, 'leaderboardRowFirst');
                        addClass(icon, 'leaderboardIconFirst');
                    } else if (data.rank === 2) {
                        addClass(iconContainer, 'leaderboardIconContainerSecond');
                        addClass(name, 'leaderboardNameSecond');
                        addClass(row, 'leaderboardRowSecond');
                        addClass(icon, 'leaderboardIconSecond');
                    } else if (data.rank === 3) {
                        addClass(iconContainer, 'leaderboardIconContainerThird');
                        addClass(name, 'leaderboardNameThird');
                        addClass(row, 'leaderboardRowThird');
                        addClass(icon, 'leaderboardIconThird');
                    }
                }
            })
            .catch((error) => {
                console.error(error);
                div.innerHTML = '<p>Failed to fetch data.</p>';
            });
    }
}
