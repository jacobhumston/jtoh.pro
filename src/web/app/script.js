{
    const root = document.documentElement;
    const localStorage = window.localStorage;
    const currentTheme = localStorage.getItem('theme');
    const prefersLightMode = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (!currentTheme) prefersLightMode ? root.classList.add('themesLight') : root.classList.add('themesDark');
    else root.classList.add(currentTheme);
}

function updateTheme(theme) {
    const root = document.documentElement;
    const localStorage = window.localStorage;
    root.classList.forEach((value) => {
        if (value.startsWith('themes')) root.classList.remove(value);
    });
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
}

function updateExampleOutput() {
    let username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) username = 'LoveliestJacob';
    document.getElementById('exampleImageOutput').src = '';
    document.getElementById('exampleImageOutput').src = `/${username}`;
}

async function copyExampleOutputURL(button) {
    if (button.innerHTML === `${getGoogleIconHTML('check')} Copied!`) return;
    let username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) username = 'LoveliestJacob';
    document.getElementById('exampleImageOutput').src = `/${username}`;
    const url = document.getElementById('exampleImageOutput').src;
    let uuid = '';
    try {
        uuid = window.crypto.randomUUID();
    } catch (e) {
        console.error(e);
        uuid = '';
    } finally {
        if (uuid !== '') {
            uuid = `?nocache=${uuid.split('-')[0]}`;
        }
    }
    await navigator.clipboard.writeText(`${url}${uuid}`).catch(() => alert('Failed to copy to clipboard!'));
    let ogText = button.innerHTML;
    button.innerHTML = `${getGoogleIconHTML('check')} Copied!`;
    button.classList.add('successButton');
    setTimeout(() => {
        button.innerHTML = ogText;
        button.classList.remove('successButton');
    }, 2000);
}

async function copyExampleOutputImage(button) {
    if (
        button.innerHTML === `${getGoogleIconHTML('check')} Copied!` ||
        button.innerHTML === `${getGoogleIconHTML('pending')} Loading...`
    )
        return;
    let username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) username = 'LoveliestJacob';
    document.getElementById('exampleImageOutput').src = `/${username}`;
    const url = document.getElementById('exampleImageOutput').src;
    let ogText = button.innerHTML;
    button.innerHTML = `${getGoogleIconHTML('pending')} Loading...`;
    const image = await fetch(url)
        .then((response) => response.blob())
        .catch(() => null);
    await navigator.clipboard
        .write([new ClipboardItem({ 'image/png': image })])
        .catch(() => alert('Failed to copy to clipboard!'));
    button.innerHTML = `${getGoogleIconHTML('check')} Copied!`;
    button.classList.add('successButton');
    setTimeout(() => {
        button.innerHTML = ogText;
        button.classList.remove('successButton');
    }, 2000);
}

async function downloadExampleOutputImage(button) {
    if (
        button.innerHTML === `${getGoogleIconHTML('check')} Downloaded!` ||
        button.innerHTML === `${getGoogleIconHTML('downloading')} Downloading...`
    )
        return;
    let username = document.getElementById('exampleInputUsername').value;
    if (!username || username.length === 0) username = 'LoveliestJacob';
    document.getElementById('exampleImageOutput').src = `/${username}`;
    const url = document.getElementById('exampleImageOutput').src;
    let ogText = button.innerHTML;
    button.innerHTML = `${getGoogleIconHTML('downloading')} Downloading...`;
    const image = await fetch(url)
        .then((response) => response.blob())
        .catch(() => null);
    URL.createObjectURL(image);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${username.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    button.innerHTML = `${getGoogleIconHTML('check')} Downloaded!`;
    button.classList.add('successButton');
    setTimeout(() => {
        button.innerHTML = ogText;
        button.classList.remove('successButton');
    }, 2000);
}

async function copyURL(url, button) {
    if (button.innerHTML === `${getGoogleIconHTML('check')} Copied!`) return;
    await navigator.clipboard.writeText(url).catch(() => alert('Failed to copy to clipboard!'));
    let ogText = button.innerHTML;
    button.innerHTML = `${getGoogleIconHTML('check')} Copied!`;
    button.classList.add('successButton');
    setTimeout(() => {
        button.innerHTML = ogText;
        button.classList.remove('successButton');
    }, 2000);
}

window.addEventListener('DOMContentLoaded', () => {
    const week = document.getElementById('requestStatsWeek');
    const month = document.getElementById('requestStatsMonth');
    const year = document.getElementById('requestStatsYear');
    const total = document.getElementById('requestStatsTotal');
    if (!week || !month || !year || !total) return;
    const formatter = new Intl.NumberFormat();
    fetch('/ext/request-count')
        .then((response) => response.json())
        .then((data) => {
            week.innerText = formatter.format(data.week);
            month.innerText = formatter.format(data.month);
            year.innerText = formatter.format(data.year);
            total.innerText = formatter.format(data.total);
        })
        .catch(() => {
            week.innerText = 'Failed to fetch data';
            month.innerText = 'Failed to fetch data';
            year.innerText = 'Failed to fetch data';
            total.innerText = 'Failed to fetch data';
        });
    document.getElementById('exampleInputUsername').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            updateExampleOutput();
        }
    });
});

// Switched to server setup.
/*
window.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const templates = {
        headerLinks: `<div id="websitesBar">
                <a href="/app/">JToH</a>
                <a href="/app/fangame/cscd/">CSCD</a>
                <a href="/app/fangame/jtohxl/">JToH XL</a>
                <a href="/app/fangame/eta/">ETA</a>
                <a href="/app/fangame/atos/">AToS</a>
            </div>
            <div id="menuBar">
                <a href="/app/">Home</a>
                <a href="/app/update-log">Update Log</a>
                <a href="/app/faq">FAQ</a>
                <a href="https://discord.com/oauth2/authorize?client_id=1285148080189997107" target="_blank">
                    Discord Bot
                </a>
            </div>`
    };
    for (const element of root.getElementsByTagName('template')) {
        if (element.dataset && templates[element.dataset.name]) {
            element.outerHTML = templates[element.dataset.name];
        }
    }
});
*/

function getGoogleIconHTML(name) {
    return `<span class="material-symbols-rounded">${name}</span>`;
}

window.addEventListener('DOMContentLoaded', () => {
    const head = document.head;
    const title = head.dataset.page;
    if (title) {
        document.title = `jtoh.pro - ${title}`;
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const username = params.get('user');
    if (username && document.getElementById('exampleInputUsername')) {
        document.getElementById('exampleInputUsername').value = encodeURIComponent(username.slice(0, 20));
        updateExampleOutput();
    }
});

window.addEventListener('load', () => {
    const root = document.documentElement;
    root.classList.add('isLoaded');
});

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('leaderboardDivContainer');
    if (!container) return;

    const url = new URL(window.location.href);
    const params = url.searchParams;
    const includeJacob = params.get('includeJacob') === 'true';
    const type = params.get('type') ?? 'card-requests';
    const other = params.get('other') ?? 'jtoh';
    const page = parseInt(params.get('page') ?? 1) ?? 1;
    const formatter = new Intl.NumberFormat();
    const description = document.getElementById('leaderboardCurrentDescription');
    const selectionContainer = document.getElementById('leaderboardSelectionContainer');
    const leaderboards = [
        {
            name: 'Card Requests',
            type: 'card-requests',
            other: ['JToH', 'AToS', 'TEA', 'JToH XL', 'JToH XXL'],
            description: 'The number of cards requested for a specific user.'
        },
        {
            name: 'Skill Points',
            type: 'skill-points',
            other: ['JToH', 'AToS', 'TEA', 'JToH XL', 'JToH XXL'],
            description: 'The number of skill points for a specific user.'
        }
    ];
    const fixOther = (string) => string.toLowerCase().replaceAll(' ', '');

    leaderboards.forEach((type) => {
        const typeContainer = document.createElement('div');
        typeContainer.classList.add('leaderboardSelectionTypeContainer');
        const name = document.createElement('span');
        name.innerHTML = `<b>${type.name}</b>`;
        name.classList.add('leaderboardSelectionType');
        typeContainer.appendChild(name);
        typeContainer.appendChild(document.createElement('br'));
        selectionContainer.appendChild(typeContainer);
        type.other.forEach((other, index) => {
            const button = document.createElement('button');
            button.innerText = other;
            button.classList.add('leaderboardSelectionButton');
            const link = `/app/leaderboards?type=${type.type}&other=${fixOther(other)}&page=1${includeJacob ? '&includeJacob=true' : ''}`;
            button.onclick = () => {
                window.location.href = link;
            };
            button.type = 'button';
            if (link === ((url) => url.pathname + url.search)(new URL(window.location.href))) {
                button.classList.add('leaderboardSelectionButtonSelected');
                button.disabled = true;
                const check = setInterval(() => {
                    if (document.documentElement.classList.contains('isLoaded')) {
                        clearInterval(check);
                        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
            typeContainer.appendChild(button);
            if (index - (1 % 3) === 1) typeContainer.appendChild(document.createElement('br'));
        });
    });

    const typeObject = leaderboards.find((x) => x.type === type);
    if (!typeObject) {
        description.innerHTML = `<p>Invalid leaderboard type.</p>`;
        return;
    }

    description.innerHTML = `<p><b>${typeObject.name}</b> (${other}) - ${typeObject.description}</p>`;

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

    function loadLeaderboard(div, type, other) {
        fetch(`/ext/leaderboards/${type}/${other}?includeJacob=${includeJacob}&page=${page}`)
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

                if (response.total.pages > 1) {
                    const pagination = document.createElement('div');
                    pagination.classList.add('leaderboardPagination');
                    div.appendChild(pagination);

                    const previous = document.createElement('button');
                    previous.innerText = 'Previous';
                    previous.classList.add('leaderboardPaginationButton');
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
                    pagination.appendChild(previous);

                    const pageText = document.createElement('span');
                    pageText.innerText = `Page ${page}/${response.total.pages}`;
                    pageText.classList.add('leaderboardPaginationText');
                    pagination.appendChild(pageText);

                    const next = document.createElement('button');
                    next.innerText = 'Next';
                    next.classList.add('leaderboardPaginationButton');
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
                    pagination.appendChild(next);
                }

                for (const data of response.result) {
                    const user = data.user;
                    const count = data.count;

                    const row = document.createElement('div');
                    row.classList.add('leaderboardRow');

                    const iconContainer = document.createElement('div');
                    iconContainer.classList.add('leaderboardIconContainer');
                    row.appendChild(iconContainer);

                    const rank = document.createElement('span');
                    rank.innerText = `#${formatter.format(data.rank)}`;
                    rank.classList.add('leaderboardRank');
                    iconContainer.appendChild(rank);

                    const icon = document.createElement('img');
                    icon.onerror = () => {
                        if (icon.src !== '/app/assets/default-roblox-profile.png') {
                            icon.src = '/app/assets/default-roblox-profile.png';
                        }
                    };
                    if (user.thumbnail === '') {
                        icon.src = '/app/assets/default-roblox-profile.png';
                    } else {
                        if (data.rank < 4) {
                            fetch(`/ext/util/user-roblox-thumbnails/${user.id}`)
                                .then(async (response) => {
                                    icon.src = (await response.json()).bust;
                                })
                                .catch(() => {});
                        } else {
                            icon.src = user.thumbnail;
                        }
                    }
                    icon.alt = 'User Icon';
                    icon.classList.add('leaderboardIcon');
                    iconContainer.appendChild(icon);

                    const name = document.createElement('span');
                    name.innerText = user.displayName;
                    name.classList.add('leaderboardName');
                    name.appendChild(document.createElement('br'));
                    row.appendChild(name);

                    const fullName = document.createElement('span');
                    fullName.innerText = `@${user.name}`;
                    fullName.classList.add('leaderboardFullName');
                    name.appendChild(fullName);

                    const countElement = document.createElement('span');
                    countElement.innerText = formatter.format(count);
                    countElement.classList.add('leaderboardCount');
                    row.appendChild(countElement);
                    div.appendChild(row);

                    if (data.rank === 1) {
                        iconContainer.classList.add('leaderboardIconContainerFirst');
                        name.classList.add('leaderboardNameFirst');
                        row.classList.add('leaderboardRowFirst');
                        icon.classList.add('leaderboardIconFirst');
                    } else if (data.rank === 2) {
                        iconContainer.classList.add('leaderboardIconContainerSecond');
                        name.classList.add('leaderboardNameSecond');
                        row.classList.add('leaderboardRowSecond');
                        icon.classList.add('leaderboardIconSecond');
                    } else if (data.rank === 3) {
                        iconContainer.classList.add('leaderboardIconContainerThird');
                        name.classList.add('leaderboardNameThird');
                        row.classList.add('leaderboardRowThird');
                        icon.classList.add('leaderboardIconThird');
                    }
                }
            })
            .catch((error) => {
                console.error(error);
                div.innerHTML = '<p>Failed to fetch data.</p>';
            });
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const themeChangeOpener = document.getElementById('themeChangeOpener');
    if (!themeChangeOpener) return;
    let enabled = false;
    themeChangeOpener.addEventListener('click', () => {
        enabled = !enabled;
        const themes = document.getElementsByClassName('themeChanger');
        const loggedInName = document.getElementById('loggedInName');
        const loggedInDetails = document.getElementById('loggedInDetails');
        for (const theme of themes) {
            theme.dataset.enabled = enabled.toString();
        }
        if (enabled) {
            //themeChangeOpener.innerHTML = `${getGoogleIconHTML('visibility_off')} Hide Themes`;
            themeChangeOpener.innerHTML = `${getGoogleIconHTML('visibility_off')}`;
            if (loggedInName) loggedInName.style.display = 'none';
            if (loggedInDetails) loggedInDetails.style.paddingRight = '0px';
        } else {
            //themeChangeOpener.innerHTML = `${getGoogleIconHTML('brush')} Change Theme`;
            themeChangeOpener.innerHTML = `${getGoogleIconHTML('brush')}`;
            if (loggedInName) loggedInName.style.display = '';
            if (loggedInDetails) loggedInDetails.style.paddingRight = '';
        }
    });

    const loggedInDetails = document.getElementById('loggedInDetails');
    const menuBar = document.getElementById('menuBar');
    if (loggedInDetails && menuBar) {
        fetch('/ext/auth/@me').then(async (response) => {
            const data = await response.json();
            const user = data.user;
            if (!user) {
                loggedInDetails.innerHTML = '<a id="loginButton" href="/login">Login</a>';
                return;
            }
            const icon = document.createElement('img');
            icon.onerror = () => {
                if (icon.src !== '/app/assets/default-roblox-profile.png') {
                    icon.src = '/app/assets/default-roblox-profile.png';
                }
            };
            icon.src = user.thumbnail;
            icon.alt = 'User Icon';
            icon.id = 'loggedInIcon';
            loggedInDetails.appendChild(icon);

            const name = document.createElement('span');
            name.innerText = user.name;
            name.id = 'loggedInName';
            loggedInDetails.appendChild(name);

            loggedInDetails.classList.add('loggedIn');

            if (data.admin === true) {
                const link = document.createElement('a');
                link.href = '/app/admin';
                link.innerText = 'Admin Panel';
                menuBar.appendChild(link);
            }
        });
    }
});
