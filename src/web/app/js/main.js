(() => {
    const _window = window;
    const _document = document;
    const _MutationObserver = MutationObserver;
    const _URL = URL;
    const _WebSocket = WebSocket;

    if (!_window.func) _window.func = {};
    const publicFunctions = _window.func;

    publicFunctions.getURL = () => new _URL(_window.location.href);
    const websocketProtocal = `${publicFunctions.getURL().protocol === 'https:' ? 'wss' : 'ws'}://`;

    {
        const root = _document.documentElement;
        const localStorage = _window.localStorage;
        const currentTheme = localStorage.getItem('theme');
        const prefersLightMode = _window.matchMedia('(prefers-color-scheme: light)').matches;
        if (!currentTheme) {
            prefersLightMode ? classListAdd(root, 'themesLight') : classListAdd(root, 'themesDark');
        } else {
            classListAdd(root, currentTheme);
        }
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

    /**
     * @param {HTMLElement} element
     * @param {...string} classes
     */
    function classListAdd(element, ...classes) {
        element.classList.add(...classes);
    }

    /**
     * @param {HTMLElement} element
     * @param {...string} classes
     */
    function classListRemove(element, ...classes) {
        element.classList.remove(...classes);
    }

    /**
     * @param {HTMLElement} element
     * @param {Node} child
     */
    function appendChild(element, child) {
        element.appendChild(child);
    }

    const createElement = (...agrs) => _document.createElement(...agrs);
    const getElementById = (...agrs) => _document.getElementById(...agrs);

    function updateTheme(theme) {
        const root = _document.documentElement;
        const localStorage = _window.localStorage;
        root.classList.forEach((value) => {
            if (value.startsWith('themes')) classListRemove(root, value);
        });
        classListAdd(root, theme);
        localStorage.setItem('theme', theme);
    }
    publicFunctions.updateTheme = updateTheme;

    function updateExampleOutput() {
        let username = getElementById('exampleInputUsername').value;
        if (!username || username.length === 0) username = 'LoveliestJacob';
        getElementById('exampleImageOutput').src = '';
        getElementById('exampleImageOutput').src = `/${username}?nocache=${genUUID().substring(0, 6)}`;
        return username;
    }
    publicFunctions.updateExampleOutput = updateExampleOutput;

    async function copyExampleOutputURL(button) {
        updateExampleOutput();

        const url = getElementById('exampleImageOutput').src;
        await navigator.clipboard.writeText(`${url}`).catch(() => alert('Failed to copy to clipboard!'));
        let ogText = button.innerHTML;
        button.innerHTML = `${getGoogleIconHTML('check')} Copied!`;
        classListAdd(button, 'successButton');
        setTimeout(() => {
            button.innerHTML = ogText;
            classListRemove(button, 'successButton');
        }, 2000);
    }
    publicFunctions.copyExampleOutputURL = copyExampleOutputURL;

    async function copyExampleOutputImage(button) {
        if (
            button.innerHTML === `${getGoogleIconHTML('check')} Copied!` ||
            button.innerHTML === `${getGoogleIconHTML('pending')} Loading...`
        )
            return;

        updateExampleOutput();

        const url = getElementById('exampleImageOutput').src;
        let ogText = button.innerHTML;
        button.innerHTML = `${getGoogleIconHTML('pending')} Loading...`;
        const image = await fetch(url)
            .then((response) => response.blob())
            .catch(() => null);
        await navigator.clipboard
            .write([new ClipboardItem({ 'image/png': image })])
            .catch(() => alert('Failed to copy to clipboard!'));
        button.innerHTML = `${getGoogleIconHTML('check')} Copied!`;
        classListAdd(button, 'successButton');
        setTimeout(() => {
            button.innerHTML = ogText;
            classListRemove(button, 'successButton');
        }, 2000);
    }
    publicFunctions.copyExampleOutputImage = copyExampleOutputImage;

    async function downloadExampleOutputImage(button) {
        if (
            button.innerHTML === `${getGoogleIconHTML('check')} Downloaded!` ||
            button.innerHTML === `${getGoogleIconHTML('downloading')} Downloading...`
        )
            return;

        const username = updateExampleOutput();

        const url = getElementById('exampleImageOutput').src;
        let ogText = button.innerHTML;
        button.innerHTML = `${getGoogleIconHTML('downloading')} Downloading...`;
        const image = await fetch(url)
            .then((response) => response.blob())
            .catch(() => null);
        URL.createObjectURL(image);
        const link = createElement('a');
        link.href = url;
        link.download = `${username.toLowerCase()}.png`;
        appendChild(_document.body, link);
        link.click();
        _document.body.removeChild(link);
        button.innerHTML = `${getGoogleIconHTML('check')} Downloaded!`;
        classListAdd(button, 'successButton');
        setTimeout(() => {
            button.innerHTML = ogText;
            classListRemove(button, 'successButton');
        }, 2000);
    }
    publicFunctions.downloadExampleOutputImage = downloadExampleOutputImage;

    async function copyURL(url, button) {
        if (button.innerHTML === `${getGoogleIconHTML('check')} Copied!`) return;
        await navigator.clipboard.writeText(url).catch(() => alert('Failed to copy to clipboard!'));
        let ogText = button.innerHTML;
        button.innerHTML = `${getGoogleIconHTML('check')} Copied!`;
        classListAdd(button, 'successButton');
        setTimeout(() => {
            button.innerHTML = ogText;
            classListRemove(button, 'successButton');
        }, 2000);
    }
    publicFunctions.copyURL = copyURL;

    _window.addEventListener('DOMContentLoaded', () => {
        const copyrightYear = getElementById('copyrightYear');
        if (copyrightYear) copyrightYear.innerText = new Date().getFullYear();

        const week = getElementById('requestStatsWeek');
        const month = getElementById('requestStatsMonth');
        const year = getElementById('requestStatsYear');
        const total = getElementById('requestStatsTotal');
        if (!week || !month || !year || !total) return;
        const formatter = new Intl.NumberFormat();
        fetch('/api/request-count')
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
        getElementById('exampleInputUsername').addEventListener('keyup', (event) => {
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
        if (!_document.getElementById('captchaContainer')) {
            const element = createElement('div');
            element.id = 'captchaContainer';
            if (getElementById('container')) {
                appendChild(getElementById('container'), element);
            } else {
                appendChild(_document.body, element);
            }
        }
        const getTurnstileToken = () =>
            new Promise((resolve) => {
                getElementById('captchaContainer').innerHTML = '';
                turnstile.render('#captchaContainer', {
                    sitekey: '0x4AAAAAAAyKalxef6nTkf7o',
                    action: 'leaderboard',
                    callback: function (token) {
                        getElementById('captchaContainer').innerHTML = '';
                        resolve(token);
                    },
                    'error-callback': async function (error) {
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
            const verified = await fetch(`/api/captcha/verify?token=${token}`).catch(() => ({
                json: () => ({
                    success: false
                })
            }));
            const verifiedData = await verified.json();
            if (verifiedData.success === true) {
                return token;
            } else {
                const newToken = await getTurnstileToken();
                const newVerified = await fetch(`/api/captcha/gateway?token=${newToken}`).catch(() => undefined);
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
        const url = new _URL(_window.location.href);
        const params = url.searchParams;
        const username = params.get('user');
        if (username && getElementById('exampleInputUsername')) {
            getElementById('exampleInputUsername').value = encodeURIComponent(username.slice(0, 20));
            updateExampleOutput();
        }
    });

    _window.addEventListener('load', () => {
        const root = _document.documentElement;
        classListAdd(root, 'isLoaded');
    });

    _window.addEventListener('DOMContentLoaded', async () => {
        const container = getElementById('leaderboardDivContainer');
        if (!container) return;

        const url = new _URL(_window.location.href);
        const params = url.searchParams;
        const includeJacob = params.get('includeJacob') === 'true';
        const type = params.get('type') ?? 'card-requests';
        const other = params.get('other') ?? 'jtoh';
        const page = parseInt(params.get('page') ?? 1) ?? 1;
        const formatter = new Intl.NumberFormat();
        const description = getElementById('leaderboardCurrentDescription');
        const selectionContainer = getElementById('leaderboardSelectionContainer');
        const leaderboards = [
            {
                name: 'Card Requests',
                type: 'card-requests',
                other: ['JToH'],
                description: 'Leaderboard for the most amount of cards requested for a specific user.'
            },
            {
                name: 'Skill Points',
                type: 'skill-points',
                other: ['JToH'],
                description: `Leaderboard of the user's with the most amount of skill points. \n${getGoogleIconHTML('info')} Skill points are calculated via completed towers amoungst other factors.`
            }
        ];
        const fixOther = (string) => string.toLowerCase().replaceAll(' ', '');

        leaderboards.forEach((thisType) => {
            const typeContainer = createElement('div');
            classListAdd(typeContainer, 'leaderboardSelectionTypeContainer');
            const name = createElement('span');
            name.innerHTML = `<b>${thisType.name}</b>`;
            classListAdd(name, 'leaderboardSelectionType');
            appendChild(typeContainer, name);
            appendChild(typeContainer, createElement('br'));
            appendChild(selectionContainer, typeContainer);
            thisType.other.forEach((thisOther, index) => {
                const button = createElement('button');
                button.innerText = thisOther;
                classListAdd(button, 'leaderboardSelectionButton');
                button.onclick = () => {
                    _window.location.href = `/app/leaderboards?type=${thisType.type}&other=${fixOther(thisOther)}&page=1${includeJacob ? '&includeJacob=true' : ''}`;
                };
                button.type = 'button';
                if (thisType.type === type && fixOther(thisOther) === other) {
                    classListAdd(button, 'leaderboardSelectionButtonSelected');
                    button.disabled = true;
                    const check = setInterval(() => {
                        if (_document.documentElement.classList.contains('isLoaded')) {
                            clearInterval(check);
                            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                }
                appendChild(typeContainer, button);
                if (index - (1 % 3) === 1) appendChild(typeContainer, createElement('br'));
            });
        });

        const typeObject = leaderboards.find((x) => x.type === type);
        if (!typeObject) {
            description.innerHTML = `<p>Invalid leaderboard type.</p>`;
            return;
        }

        description.innerHTML =
            `<p>${getGoogleIconHTML('trophy')} <b>${typeObject.name}</b> (${other}) - ${typeObject.description}</p>`.replaceAll(
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

        async function loadLeaderboard(div, type, other) {
            const token = await sec();
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
                        userCount.innerHTML = `${getGoogleIconHTML('group')} <b>${formatter.format(response.total.users)}</b> users in this leaderboard.`;
                        classListAdd(userCount, 'leaderboardUserCount');
                        appendChild(div, userCount);

                        if (response.me) {
                            const myRank = createElement('span');
                            myRank.innerHTML = `${getGoogleIconHTML('person')} You are ranked <b>#${formatter.format(response.me.rank)}</b>.`;
                            classListAdd(myRank, 'leaderboardMyRank');
                            appendChild(div, myRank);
                        }

                        const pagination = createElement('div');
                        classListAdd(pagination, 'leaderboardPagination');
                        appendChild(div, pagination);

                        const previous = createElement('button');
                        previous.innerText = 'Previous';
                        classListAdd(previous, 'leaderboardPaginationButton');
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
                        appendChild(pagination, previous);

                        const pageText = createElement('span');
                        pageText.innerText = `Page ${page}/${response.total.pages}`;
                        classListAdd(pageText, 'leaderboardPaginationText');
                        appendChild(pagination, pageText);

                        const next = createElement('button');
                        next.innerText = 'Next';
                        classListAdd(next, 'leaderboardPaginationButton');
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
                        appendChild(pagination, next);
                    }

                    for (const data of response.result) {
                        const user = data.user;
                        const count = data.count;

                        const row = createElement('div');
                        classListAdd(row, 'leaderboardRow');

                        const rank = createElement('span');
                        rank.innerText = `#${formatter.format(data.rank)}`;
                        classListAdd(rank, 'leaderboardRank');
                        appendChild(div, rank);

                        const iconContainer = createElement('div');
                        classListAdd(iconContainer, 'leaderboardIconContainer');
                        appendChild(row, iconContainer);

                        const icon = createElement('img');
                        icon.onerror = () => {
                            if (icon.src !== '/app/assets/default-roblox-profile.png') {
                                icon.src = '/app/assets/default-roblox-profile.png';
                            }
                        };

                        function setImageSource(icon) {
                            if (user.thumbnail === '') {
                                icon.src = '/app/assets/default-roblox-profile.png';
                            } else {
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
                        classListAdd(icon, 'leaderboardIcon');
                        appendChild(iconContainer, icon);

                        const name = createElement('span');
                        name.innerText = user.displayName;
                        classListAdd(name, 'leaderboardName');
                        appendChild(name, createElement('br'));
                        appendChild(row, name);

                        const fullName = createElement('span');
                        fullName.innerText = `@${user.name}`;
                        classListAdd(fullName, 'leaderboardFullName');
                        appendChild(name, fullName);

                        const countElement = createElement('span');
                        countElement.innerText = formatter.format(count);
                        if (countElement.innerText.includes('.')) {
                            const decimal = countElement.innerText.split('.')[1];
                            countElement.innerText = countElement.innerText.split('.')[0];
                            const decimalElement = createElement('span');
                            decimalElement.innerText = `.${decimal}`;
                            classListAdd(decimalElement, 'leaderboardDecimal');
                            appendChild(countElement, decimalElement);
                        }
                        classListAdd(countElement, 'leaderboardCount');
                        appendChild(row, countElement);
                        appendChild(div, row);

                        if (data.rank === 1) {
                            classListAdd(iconContainer, 'leaderboardIconContainerFirst');
                            classListAdd(name, 'leaderboardNameFirst');
                            classListAdd(row, 'leaderboardRowFirst');
                            classListAdd(icon, 'leaderboardIconFirst');
                        } else if (data.rank === 2) {
                            classListAdd(iconContainer, 'leaderboardIconContainerSecond');
                            classListAdd(name, 'leaderboardNameSecond');
                            classListAdd(row, 'leaderboardRowSecond');
                            classListAdd(icon, 'leaderboardIconSecond');
                        } else if (data.rank === 3) {
                            classListAdd(iconContainer, 'leaderboardIconContainerThird');
                            classListAdd(name, 'leaderboardNameThird');
                            classListAdd(row, 'leaderboardRowThird');
                            classListAdd(icon, 'leaderboardIconThird');
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
        const themeChangeOpener = getElementById('themeChangeOpener');
        if (!themeChangeOpener) return;
        let enabled = false;
        themeChangeOpener.addEventListener('click', () => {
            enabled = !enabled;
            const themes = _document.getElementsByClassName('themeChanger');
            const loggedInName = getElementById('loggedInName');
            const loggedInDetails = getElementById('loggedInDetails');
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

        const loggedInDetails = getElementById('loggedInDetails');
        const menuBar = getElementById('menuBar');
        if (loggedInDetails && menuBar) {
            fetch('/api/auth/@me').then(async (response) => {
                const data = await response.json();
                const user = data.user;
                if (!user) {
                    loggedInDetails.innerHTML = '<a id="loginButton" href="/login">Login</a>';
                    const url = new _URL(_window.location.href);
                    if (url.pathname === '/app/captcha') loggedInDetails.innerHTML = '';
                    _window.loggedIn = false;
                    _window.loggedInUser = null;
                    return;
                }
                _window.loggedIn = true;
                _window.loggedInUser = user;
                const icon = createElement('img');
                icon.onerror = () => {
                    if (icon.src !== '/app/assets/default-roblox-profile.png') {
                        icon.src = '/app/assets/default-roblox-profile.png';
                    }
                };
                icon.src = user.thumbnail;
                icon.alt = 'User Icon';
                icon.id = 'loggedInIcon';
                appendChild(loggedInDetails, icon);

                const name = createElement('span');
                name.innerText = user.name;
                name.id = 'loggedInName';
                appendChild(loggedInDetails, name);

                classListAdd(loggedInDetails, 'loggedIn');

                if (data.admin === true) {
                    const link = createElement('a');
                    link.href = '/app/admin';
                    link.innerText = 'Admin Panel';
                    appendChild(menuBar, link);
                }
            });

            const menuBarLinks = menuBar.getElementsByTagName('a');
            for (const link of menuBarLinks) {
                if (new _URL(link.href).pathname === new _URL(_window.location.href).pathname) {
                    classListAdd(link, 'menuBarActive');
                }
            }

            const blogDetails = getElementById('blogDetails');
            if (blogDetails) {
                const data = JSON.parse(decodeURIComponent(blogDetails.dataset.json));
                const createdSpan = createElement('span');
                createdSpan.innerHTML = `${getGoogleIconHTML('calendar_add_on')} <b>Posted:</b> ${new Date(data.created).toLocaleString()}`;
                appendChild(blogDetails, createdSpan);
                appendChild(blogDetails, createElement('br'));
                const editedSpan = createElement('span');
                editedSpan.innerHTML = `${getGoogleIconHTML('edit')} <b>Last Edited:</b> ${new Date(data.lastEdited).toLocaleString()}${data.editCount > 1 ? ` <i>(${data.editCount} Edits)</i>` : ''}`;
                appendChild(blogDetails, editedSpan);
                const parent = blogDetails.parentElement;
                const source = createElement('a');
                source.href = data.source;
                source.innerText = 'This post is open source.';
                classListAdd(source, 'blogSource');
                appendChild(parent, source);
            }
        }

        (async () => {
            if (getElementById('captchaNotice')) {
                const url = new _URL(_window.location.href);
                const params = url.searchParams;
                const type = params.get('type');
                if (type === 'auth') {
                    try {
                        _window.history.replaceState({}, document.title, '/app/captcha');
                    } catch (e) {
                        console.error(e);
                    }
                    const token = await sec();
                    _document.location.href = `/api/auth?captcha=${token}&code=${params.get('code')}`;
                } else {
                    _document.location.href = '/';
                }
            }
        })();

        (() => {
            function addImageEventListeners(img) {
                img.addEventListener('load', (event) => {
                    classListAdd(event.target, 'imageIsLoaded');
                });
                img.addEventListener('error', (event) => {
                    classListRemove(event.target, 'imageIsLoaded');
                });
                if (img.complete && img.naturalWidth !== 0) {
                    classListAdd(img, 'imageIsLoaded');
                }
                const attributeObserver = new _MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                            classListRemove(img, 'imageIsLoaded');
                        }
                    }
                });
                attributeObserver.observe(img, { attributes: true });
            }

            const observer = new _MutationObserver((mutationsList) => {
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

    _window.addEventListener('load', async () => {
        const blogPostsList = getElementById('blogPostsList');
        if (!blogPostsList) return;

        let sort = 'created';
        const url = new _URL(_window.location.href);
        const params = url.searchParams;
        if (params.has('sort')) {
            sort = params.get('sort');
        }

        const list = await fetch('/api/blog-posts?sort=' + sort).catch(() => null);

        if (!list) {
            blogPostsList.innerHTML = '<p>Failed to fetch data.</p>';
            return;
        }

        const data = await list.json();
        if (data.error) {
            blogPostsList.innerHTML = '<p>Failed to fetch data.</p>';
            return;
        }

        function update() {
            let posts = data.posts;
            const search = getElementById('blogSearch').value;
            if (search && search.length > 0) {
                posts = posts.filter((post) => {
                    return (
                        post.title.toLowerCase().includes(search.toLowerCase()) ||
                        post.summary.toLowerCase().includes(search.toLowerCase()) ||
                        post.author.user.displayName.toLowerCase().includes(search.toLowerCase())
                    );
                });
            }

            blogPostsList.innerHTML = '';
            for (const post of posts) {
                const postElement = createElement('div');
                classListAdd(postElement, 'blogPostListElement');

                const title = createElement('h2');
                title.innerText = post.title;
                appendChild(postElement, title);

                const author = createElement('span');
                author.innerHTML = `${getGoogleIconHTML('person')} <b>By:</b> <a href="https://roblox.com/users/${post.author.user.id}/profile/">${post.author.user.displayName}</a>`;
                appendChild(postElement, author);

                appendChild(postElement, createElement('br'));

                const created = createElement('span');
                created.innerHTML = `${getGoogleIconHTML('calendar_add_on')} <b>Posted:</b> ${new Date(post.created).toLocaleString()}`;
                appendChild(postElement, created);

                const summary = createElement('p');
                summary.innerText = post.summary;
                appendChild(postElement, summary);

                const viewButton = createElement('a');
                viewButton.innerText = 'View Post';
                viewButton.href = post.path;
                classListAdd(viewButton, 'blogPostViewButton');
                appendChild(postElement, viewButton);
                appendChild(blogPostsList, postElement);

                if (search && search.length > 0) {
                    const searchRegex = new RegExp(search, 'gi');
                    title.innerHTML = title.innerHTML.replaceAll(
                        searchRegex,
                        (match) => `<span class="highlight">${match}</span>`
                    );
                    summary.innerHTML = summary.innerHTML.replaceAll(
                        searchRegex,
                        (match) => `<span class="highlight">${match}</span>`
                    );
                    author.innerHTML = `${getGoogleIconHTML('person')} <b>By:</b> <a href="https://roblox.com/users/${post.author.user.id}/profile/">${post.author.user.displayName.replaceAll(searchRegex, (match) => `<span class="highlight">${match}</span>`)}</a>`;
                }
            }

            if (posts.length === 0) {
                blogPostsList.innerHTML = '<p>No results found for your search query.</p>';
            }
        }

        update();

        const blogSort = getElementById('blogSort');
        if (blogSort) {
            blogSort.addEventListener('change', (event) => {
                _window.location.href = `/app/blog?sort=${event.target.value}`;
            });
            for (const option of blogSort.getElementsByTagName('option')) {
                if (option.value === sort) {
                    option.selected = true;
                }
            }
        }

        const blogSearch = getElementById('blogSearch');
        const blogSearchButton = getElementById('blogSearchButton');
        const blogClearSearchButton = getElementById('blogClearSearchButton');

        blogSearch.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                update();
            }
        });
        blogSearchButton.addEventListener('click', update);
        blogClearSearchButton.addEventListener('click', () => {
            blogSearch.value = '';
            update();
        });
    });

    _window.addEventListener('DOMContentLoaded', () => {
        const loadBadges = getElementById('loadBadges');
        if (!loadBadges) return;

        const loadBadgesUsername = getElementById('loadBadgesUsername');
        const badgeContainer = getElementById('badgesContainer');
        const badgeStatBar = getElementById('badgeStatBar');

        loadBadges.onclick = async () => {
            const timeStarted = Date.now();

            loadBadges.disabled = true;
            badgeContainer.style.display = 'none';

            const resultId = await fetch(
                `/api/badges/check?username=${loadBadgesUsername.value}&captcha=${await sec()}`
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

            progressBar.style.display = 'block';
            progressBarFill.style.width = '0%';
            progressBarFill.innerHTML = '0% <img>';

            const socket = new _WebSocket(
                `${websocketProtocal}${publicFunctions.getURL().host}/api/socket?type=badge-check-progress&resultId=${resultId}`
            );

            socket.addEventListener('message', (data) => {
                //console.log('MESSAGE', data.data);
                const parsed = JSON.parse(data.data);
                if (!parsed.progress) return;
                progressBarFill.style.width = `${parsed.progress}%`;
                progressBarFill.innerHTML = `${Math.floor(parsed.progress)}% <img>`;

                let timePassed = ((Date.now() - timeStarted) / 1000).toFixed(2);

                badgeStatBar.style.display = 'block';
                badgeStatBar.innerHTML = `${getGoogleIconHTML('award_star')} <b>${parsed.completed}</b>/<b>${parsed.total}</b> — ${getGoogleIconHTML('wifi')} <b>${parsed.requests.success}</b>/<b>${parsed.requests.retry}</b> — ${getGoogleIconHTML('timer')} <b>${timePassed}s</b>`;
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
                const result2 = await fetch(`/api/badges/all?captcha=${await sec()}`).then((response) =>
                    response.json()
                );

                if (result2.error) {
                    alert('Failed to fetch badge data.');
                    return;
                }

                badgeContainer.style.display = 'block';
                for (const [id, badges] of Object.entries(result2.games)) {
                    if (badges.length === 0) continue;

                    const game = badges[0].awardingUniverse;
                    const gameId = game.id;
                    const gameName = game.name;

                    const gameContainer = createElement('div');
                    classListAdd(gameContainer, 'badgeGameContainer');

                    const gameTitle = createElement('h2');
                    gameTitle.innerText = gameName;
                    appendChild(gameContainer, gameTitle);

                    const gameBadges = createElement('div');
                    classListAdd(gameBadges, 'badgeGameBadges');
                    appendChild(gameContainer, gameBadges);

                    const viewBadgesButton = createElement('button');
                    viewBadgesButton.innerText = 'View Badges';
                    viewBadgesButton.type = 'button';
                    viewBadgesButton.onclick = () => {
                        viewBadgesButton.remove();

                        for (const badge of badges) {
                            const badgeOwnershipDetails = result.find((x) => x.id === badge.id);

                            const badgeElement = createElement('div');
                            classListAdd(badgeElement, 'badgeElement');

                            const name = createElement('span');
                            name.innerText = (badge.name ?? 'No name available.')
                                .replaceAll('\r', '')
                                .replaceAll('\n', ' ');
                            classListAdd(name, 'badgeName');

                            const description = createElement('span');
                            description.innerText = (badge.description ?? 'No description available.')
                                .replaceAll('\r', '')
                                .replaceAll('\n', ' ');
                            classListAdd(description, 'badgeDescription');
                            if (badge.description === null) classListAdd(description, 'badgeNoDescription');

                            const awardedOn = createElement('span');
                            if (badgeOwnershipDetails.owned) {
                                awardedOn.innerText = `Awarded on ${new Date(badgeOwnershipDetails.awarded).toLocaleString()}`;
                                classListAdd(badgeElement, 'badgeOwned');
                            } else {
                                awardedOn.innerText = 'Not awarded.';
                                classListAdd(badgeElement, 'badgeNotOwned');
                            }
                            classListAdd(awardedOn, 'badgeAwardedOn');

                            awardedOn.innerHTML = `${awardedOn.innerText}<br><a target="_blank" href="https://www.roblox.com/badges/${badge.id}">View on Roblox</a>`;

                            const image = createElement('img');
                            image.alt = badge.name;
                            classListAdd(image, 'badgeImage');

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
                            classListAdd(badgeDetails, 'badgeDetails');
                            appendChild(badgeElement, image);
                            appendChild(badgeDetails, name);
                            appendChild(badgeDetails, description);
                            appendChild(badgeDetails, awardedOn);
                            appendChild(badgeElement, badgeDetails);
                            appendChild(gameBadges, badgeElement);
                        }
                    };

                    appendChild(gameBadges, viewBadgesButton);
                    appendChild(badgeContainer, gameContainer);
                }

                // progressBarFill.innerText = `Done! Loaded in ${((Date.now() - timeStarted) / 1000).toFixed(2)}s`;

                progressBar.style.display = 'none';
                loadBadges.disabled = false;
                //badgeStatBar.style.display = 'none';
            });
        };
    });
})();
