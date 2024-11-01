(() => {
    const _window = window;
    const _document = document;

    if (!_window.func) _window.func = {};
    const publicFunctions = _window.func;

    {
        const root = _document.documentElement;
        const localStorage = _window.localStorage;
        const currentTheme = localStorage.getItem('theme');
        const prefersLightMode = _window.matchMedia('(prefers-color-scheme: light)').matches;
        if (!currentTheme) prefersLightMode ? root.classList.add('themesLight') : root.classList.add('themesDark');
        else root.classList.add(currentTheme);
    }

    function genUUID() {
        let uuid = '';
        try {
            uuid = _window.crypto.randomUUID();
        } catch (e) {
            console.error(e);
            // https://www.grepper.com/answers/653315/js+uuid+generator?ucard=1
            uuid = String('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, (character) => {
                const random = (Math.random() * 16) | 0;
                const value = character === 'x' ? random : (random & 0x3) | 0x8;
                return value.toString(16);
            });
        }
        return uuid;
    }

    function updateTheme(theme) {
        const root = _document.documentElement;
        const localStorage = _window.localStorage;
        root.classList.forEach((value) => {
            if (value.startsWith('themes')) root.classList.remove(value);
        });
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }
    publicFunctions.updateTheme = updateTheme;

    function updateExampleOutput() {
        let username = _document.getElementById('exampleInputUsername').value;
        if (!username || username.length === 0) username = 'LoveliestJacob';
        _document.getElementById('exampleImageOutput').src = '';
        _document.getElementById('exampleImageOutput').src = `/${username}?nocache=${genUUID()}`;
    }
    publicFunctions.updateExampleOutput = updateExampleOutput;

    async function copyExampleOutputURL(button) {
        if (button.innerHTML === `${getGoogleIconHTML('check')} Copied!`) return;
        let username = _document.getElementById('exampleInputUsername').value;
        if (!username || username.length === 0) username = 'LoveliestJacob';
        _document.getElementById('exampleImageOutput').src = `/${username}?nocache=${genUUID()}`;
        const url = _document.getElementById('exampleImageOutput').src;
        await navigator.clipboard
            .writeText(`${url}?nocache=${genUUID()}`)
            .catch(() => alert('Failed to copy to clipboard!'));
        let ogText = button.innerHTML;
        button.innerHTML = `${getGoogleIconHTML('check')} Copied!`;
        button.classList.add('successButton');
        setTimeout(() => {
            button.innerHTML = ogText;
            button.classList.remove('successButton');
        }, 2000);
    }
    publicFunctions.copyExampleOutputURL = copyExampleOutputURL;

    async function copyExampleOutputImage(button) {
        if (
            button.innerHTML === `${getGoogleIconHTML('check')} Copied!` ||
            button.innerHTML === `${getGoogleIconHTML('pending')} Loading...`
        )
            return;
        let username = _document.getElementById('exampleInputUsername').value;
        if (!username || username.length === 0) username = 'LoveliestJacob';
        _document.getElementById('exampleImageOutput').src = `/${username}?nocache=${genUUID()}`;
        const url = _document.getElementById('exampleImageOutput').src;
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
    publicFunctions.copyExampleOutputImage = copyExampleOutputImage;

    async function downloadExampleOutputImage(button) {
        if (
            button.innerHTML === `${getGoogleIconHTML('check')} Downloaded!` ||
            button.innerHTML === `${getGoogleIconHTML('downloading')} Downloading...`
        )
            return;
        let username = _document.getElementById('exampleInputUsername').value;
        if (!username || username.length === 0) username = 'LoveliestJacob';
        _document.getElementById('exampleImageOutput').src = `/${username}?nocache=${genUUID()}`;
        const url = _document.getElementById('exampleImageOutput').src;
        let ogText = button.innerHTML;
        button.innerHTML = `${getGoogleIconHTML('downloading')} Downloading...`;
        const image = await fetch(url)
            .then((response) => response.blob())
            .catch(() => null);
        URL.createObjectURL(image);
        const link = _document.createElement('a');
        link.href = url;
        link.download = `${username.toLowerCase()}.png`;
        _document.body.appendChild(link);
        link.click();
        _document.body.removeChild(link);
        button.innerHTML = `${getGoogleIconHTML('check')} Downloaded!`;
        button.classList.add('successButton');
        setTimeout(() => {
            button.innerHTML = ogText;
            button.classList.remove('successButton');
        }, 2000);
    }
    publicFunctions.downloadExampleOutputImage = downloadExampleOutputImage;

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
    publicFunctions.copyURL = copyURL;

    _window.addEventListener('DOMContentLoaded', () => {
        const week = _document.getElementById('requestStatsWeek');
        const month = _document.getElementById('requestStatsMonth');
        const year = _document.getElementById('requestStatsYear');
        const total = _document.getElementById('requestStatsTotal');
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
        _document.getElementById('exampleInputUsername').addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                updateExampleOutput();
            }
        });
    });

    // Switched to server setup.
    /*
_window.addEventListener('DOMContentLoaded', () => {
    const root = _document.documentElement;
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
        return `<span class="materialSymbolsRounded">${name}</span>`;
    }

    async function isLoggedIn() {
        return new Promise((resolve) => {
            const me = setInterval(() => {
                if (_window.loggedIn === undefined) return;
                resolve(_window.loggedIn);
                clearInterval(me);
            }, 0);
        });
    }

    async function sec() {
        const getTurnstileToken = () =>
            new Promise((resolve) => {
                _document.getElementById('captchaContainer').innerHTML = '';
                turnstile.render('#captchaContainer', {
                    sitekey: '0x4AAAAAAAyKalxef6nTkf7o',
                    action: 'leaderboard',
                    callback: function (token) {
                        _document.getElementById('captchaContainer').innerHTML = '';
                        resolve(token);
                    },
                    'error-callback': function (error) {
                        console.error(error);
                        resolve(undefined);
                    },
                    'unsupported-callback': function () {
                        console.error('Unsupported browser');
                        alert(
                            'Your browser is not supported by our captcha system, please update your browser or try a different one.'
                        );
                        resolve(undefined);
                    }
                });
            });
        if (await isLoggedIn()) {
            const token = sessionStorage.getItem('captchaGateway');
            const verified = await fetch(`/ext/captcha/verify?token=${token}`).catch(() => ({
                json: () => ({
                    success: false
                })
            }));
            const verifiedData = await verified.json();
            if (verifiedData.success === true) {
                return token;
            } else {
                const newToken = await getTurnstileToken();
                const newVerified = await fetch(`/ext/captcha/gateway?token=${newToken}`).catch(() => undefined);
                if (!newVerified) return await getTurnstileToken();
                const data = await newVerified.json();
                if (data.error) return await getTurnstileToken();
                const verifiedToken = data.token;
                sessionStorage.setItem('captchaGateway', verifiedToken);
                return verifiedToken;
            }
        } else {
            return await getTurnstileToken();
        }
    }

    _window.addEventListener('DOMContentLoaded', () => {
        const head = _document.head;
        const title = head.dataset.page;
        if (title) {
            _document.title = `jtoh.pro - ${title}`;
        }
    });

    _window.addEventListener('DOMContentLoaded', () => {
        const url = new URL(_window.location.href);
        const params = url.searchParams;
        const username = params.get('user');
        if (username && _document.getElementById('exampleInputUsername')) {
            _document.getElementById('exampleInputUsername').value = encodeURIComponent(username.slice(0, 20));
            updateExampleOutput();
        }
    });

    _window.addEventListener('load', () => {
        const root = _document.documentElement;
        root.classList.add('isLoaded');
    });

    _window.addEventListener('DOMContentLoaded', async () => {
        const container = _document.getElementById('leaderboardDivContainer');
        if (!container) return;

        const url = new URL(_window.location.href);
        const params = url.searchParams;
        const includeJacob = params.get('includeJacob') === 'true';
        const type = params.get('type') ?? 'card-requests';
        const other = params.get('other') ?? 'jtoh';
        const page = parseInt(params.get('page') ?? 1) ?? 1;
        const formatter = new Intl.NumberFormat();
        const description = _document.getElementById('leaderboardCurrentDescription');
        const selectionContainer = _document.getElementById('leaderboardSelectionContainer');
        const leaderboards = [
            {
                name: 'Card Requests',
                type: 'card-requests',
                other: ['JToH', 'AToS', 'TEA', 'JToH XL', 'JToH XXL'],
                description: 'Leaderboard for the most amount of cards requested for a specific user.'
            },
            {
                name: 'Skill Points',
                type: 'skill-points',
                other: ['JToH', 'AToS', 'TEA', 'JToH XL', 'JToH XXL'],
                description:
                    "Leaderboard of the user's with the most amount of skill points. Skill points are calculated via completed towers amoungst other factors."
            }
        ];
        const fixOther = (string) => string.toLowerCase().replaceAll(' ', '');

        leaderboards.forEach((thisType) => {
            const typeContainer = _document.createElement('div');
            typeContainer.classList.add('leaderboardSelectionTypeContainer');
            const name = _document.createElement('span');
            name.innerHTML = `<b>${thisType.name}</b>`;
            name.classList.add('leaderboardSelectionType');
            typeContainer.appendChild(name);
            typeContainer.appendChild(_document.createElement('br'));
            selectionContainer.appendChild(typeContainer);
            thisType.other.forEach((thisOther, index) => {
                const button = _document.createElement('button');
                button.innerText = thisOther;
                button.classList.add('leaderboardSelectionButton');
                button.onclick = () => {
                    _window.location.href = `/app/leaderboards?type=${thisType.type}&other=${fixOther(thisOther)}&page=1${includeJacob ? '&includeJacob=true' : ''}`;
                };
                button.type = 'button';
                if (thisType.type === type && fixOther(thisOther) === other) {
                    button.classList.add('leaderboardSelectionButtonSelected');
                    button.disabled = true;
                    const check = setInterval(() => {
                        if (_document.documentElement.classList.contains('isLoaded')) {
                            clearInterval(check);
                            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                }
                typeContainer.appendChild(button);
                if (index - (1 % 3) === 1) typeContainer.appendChild(_document.createElement('br'));
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

        async function loadLeaderboard(div, type, other) {
            const token = await sec();
            div.innerHTML = 'Loading... Please wait.';
            fetch(`/ext/leaderboards/${type}/${other}?includeJacob=${includeJacob}&page=${page}&captcha=${token}`)
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
                        const pagination = _document.createElement('div');
                        pagination.classList.add('leaderboardPagination');
                        div.appendChild(pagination);

                        const previous = _document.createElement('button');
                        previous.innerText = 'Previous';
                        previous.classList.add('leaderboardPaginationButton');
                        previous.type = 'button';
                        if (page > 1) {
                            previous.onclick = () => {
                                _window.location.href = `/app/leaderboards?type=${type}&other=${other}&page=${page - 1}${
                                    includeJacob ? '&includeJacob=true' : ''
                                }`;
                            };
                        } else {
                            previous.disabled = true;
                        }
                        pagination.appendChild(previous);

                        const pageText = _document.createElement('span');
                        pageText.innerText = `Page ${page}/${response.total.pages}`;
                        pageText.classList.add('leaderboardPaginationText');
                        pagination.appendChild(pageText);

                        const next = _document.createElement('button');
                        next.innerText = 'Next';
                        next.classList.add('leaderboardPaginationButton');
                        next.type = 'button';
                        if (page < response.total.pages) {
                            next.onclick = () => {
                                _window.location.href = `/app/leaderboards?type=${type}&other=${other}&page=${page + 1}${
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

                        const row = _document.createElement('div');
                        row.classList.add('leaderboardRow');

                        const rank = _document.createElement('span');
                        rank.innerText = `#${formatter.format(data.rank)}`;
                        rank.classList.add('leaderboardRank');
                        div.appendChild(rank);

                        const iconContainer = _document.createElement('div');
                        iconContainer.classList.add('leaderboardIconContainer');
                        row.appendChild(iconContainer);

                        const icon = _document.createElement('img');
                        icon.onerror = () => {
                            if (icon.src !== '/app/assets/default-roblox-profile.png') {
                                icon.src = '/app/assets/default-roblox-profile.png';
                            }
                        };
                        if (user.thumbnail === '') {
                            icon.src = '/app/assets/default-roblox-profile.png';
                        } else {
                            if (data.rank < 4) {
                                icon.src = user.thumbnail;
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

                        const name = _document.createElement('span');
                        name.innerText = user.displayName;
                        name.classList.add('leaderboardName');
                        name.appendChild(_document.createElement('br'));
                        row.appendChild(name);

                        const fullName = _document.createElement('span');
                        fullName.innerText = `@${user.name}`;
                        fullName.classList.add('leaderboardFullName');
                        name.appendChild(fullName);

                        const countElement = _document.createElement('span');
                        countElement.innerText = formatter.format(count);
                        if (countElement.innerText.includes('.')) {
                            const decimal = countElement.innerText.split('.')[1];
                            countElement.innerText = countElement.innerText.split('.')[0];
                            const decimalElement = _document.createElement('span');
                            decimalElement.innerText = `.${decimal}`;
                            decimalElement.classList.add('leaderboardDecimal');
                            countElement.appendChild(decimalElement);
                        }
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

    _window.addEventListener('DOMContentLoaded', () => {
        const themeChangeOpener = _document.getElementById('themeChangeOpener');
        if (!themeChangeOpener) return;
        let enabled = false;
        themeChangeOpener.addEventListener('click', () => {
            enabled = !enabled;
            const themes = _document.getElementsByClassName('themeChanger');
            const loggedInName = _document.getElementById('loggedInName');
            const loggedInDetails = _document.getElementById('loggedInDetails');
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

        const loggedInDetails = _document.getElementById('loggedInDetails');
        const menuBar = _document.getElementById('menuBar');
        if (loggedInDetails && menuBar) {
            fetch('/ext/auth/@me').then(async (response) => {
                const data = await response.json();
                const user = data.user;
                if (!user) {
                    loggedInDetails.innerHTML = '<a id="loginButton" href="/login">Login</a>';
                    _window.loggedIn = false;
                    _window.loggedInUser = null;
                    return;
                }
                _window.loggedIn = true;
                _window.loggedInUser = user;
                const icon = _document.createElement('img');
                icon.onerror = () => {
                    if (icon.src !== '/app/assets/default-roblox-profile.png') {
                        icon.src = '/app/assets/default-roblox-profile.png';
                    }
                };
                icon.src = user.thumbnail;
                icon.alt = 'User Icon';
                icon.id = 'loggedInIcon';
                loggedInDetails.appendChild(icon);

                const name = _document.createElement('span');
                name.innerText = user.name;
                name.id = 'loggedInName';
                loggedInDetails.appendChild(name);

                loggedInDetails.classList.add('loggedIn');

                if (data.admin === true) {
                    const link = _document.createElement('a');
                    link.href = '/app/admin';
                    link.innerText = 'Admin Panel';
                    menuBar.appendChild(link);
                }
            });
        }

        (async () => {
            if (_document.getElementById('captchaNotice')) {
                const url = new URL(_window.location.href);
                const params = url.searchParams;
                const type = params.get('type');
                if (type === 'auth') {
                    try {
                        window.history.replaceState({}, document.title, '/app/captcha');
                    } catch (e) {
                        console.error(e);
                    }
                    const token = await sec();
                    _document.location.href = `/ext/auth?captcha=${token}&code=${params.get('code')}`;
                } else {
                    _document.location.href = '/';
                }
            }
        })();

        (() => {
            function addImageEventListeners(img) {
                img.addEventListener('load', (event) => {
                    event.target.classList.add('imageIsLoaded');
                });
                img.addEventListener('error', (event) => {
                    event.target.classList.remove('imageIsLoaded');
                });
                if (img.complete && img.naturalWidth !== 0) {
                    img.classList.add('imageIsLoaded');
                }
                const attributeObserver = new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                            img.classList.remove('imageIsLoaded');
                        }
                    }
                });
                attributeObserver.observe(img, { attributes: true });
            }

            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        for (const node of mutation.addedNodes) {
                            if (node.tagName === 'IMG') {
                                addImageEventListeners(node);
                            } else if (node.nodeType === Node.ELEMENT_NODE) {
                                const imgs = node.getElementsByTagName('img');
                                for (const img of imgs) {
                                    addImageEventListeners(img);
                                }
                            }
                        }
                    }
                }
            });

            observer.observe(_document.body, { childList: true, subtree: true });

            const existingImages = _document.getElementsByTagName('img');
            for (const img of existingImages) {
                addImageEventListeners(img);
            }
        })();
    });
})();
