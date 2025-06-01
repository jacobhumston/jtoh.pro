import { createErrorPopup } from './quick-elements';
import {
    getElementById,
    getPageFileName,
    waitForElementById,
    createElement,
    addChild,
    addClass,
    getWebIconHTML
} from './util';

/** Original URL. */
const originalLocation = document.location.href;

/**
 * Represents a user.
 */
export type User = {
    id: number;
    username: string;
    name: string;
    thumbnail: string;
};

/**
 * Represents a logged in user.
 */
export type LoggedInUser = {
    user: null | User;
    admin: boolean;
    mod: boolean;
};

let user: null | LoggedInUser = null;

/**
 * Get user via auth API.
 */
export async function requestAuthMe() {
    return await fetch('/api/auth/@me').catch(() => ({
        json: () => ({ user: null, admin: false, mod: false }),
        status: 200
    }));
}

/**
 * Checks if a user is logged in and updates internal state.
 */
export async function checkAuth() {
    if (user) return user;

    const localStorage = window.localStorage;
    const cachedUser = localStorage.getItem('cache_LoggedInUser');
    if (cachedUser) {
        user = JSON.parse(cachedUser);
        new Promise(async (resolve) => {
            const response = await requestAuthMe();
            if (response.status === 200) {
                const data: LoggedInUser = await response.json();
                if (!data.user || data.user.id !== user?.user?.id) {
                    localStorage.removeItem('cache_LoggedInUser');
                    if (document.location.href === originalLocation) document.location.reload();
                    else document.location.href = originalLocation;
                }
            } else {
                createErrorPopup('Failed to verify that you are a logged in user.', 4000);
            }
            resolve(void 0);
        });
    }

    if (user) return user;
    const response = await requestAuthMe();
    if (response.status === 200) {
        const data: LoggedInUser = await response.json();
        user = data;
        if (user.user) localStorage.setItem('cache_LoggedInUser', JSON.stringify(data));
    } else {
        createErrorPopup('Failed to check for a logged in user.', 4000);
        user = { user: null, admin: false, mod: false };
    }
}

/**
 * Get the logged in user.
 * @returns The logged in user.
 */
export async function getLoggedInUser(): Promise<LoggedInUser> {
    await checkAuth();
    if (!user) return { user: null, admin: false, mod: false };
    return user;
}

/**
 * Returns whether the user is logged in.
 * @returns Whether the user is logged in.
 */
export async function isLoggedIn() {
    await checkAuth();
    if (!user) return false;
    return user.user !== null;
}

/**
 * Add auth UI elements to the page.
 */
export async function addAuthUI() {
    const loggedInDetails = await waitForElementById('loggedInDetails', { timeout: 2000, interval: 1 });
    if (!loggedInDetails) return;

    const user = await getLoggedInUser();
    if (user.user) {
        const menuBar = getElementById('menuBar');
        if (!menuBar) return;

        const themeContainer = getElementById('themeContainer');
        if (!themeContainer) return;

        const loggedInDetails = getElementById('loggedInDetails');
        if (!loggedInDetails) return;

        const url = new URL(document.location.href);

        if (!url.pathname.startsWith('/app/account/')) {
            const settingsButton = createElement('button', {
                id: 'settingsOpener',
                innerHTML: `${getWebIconHTML('settings')} Settings`,
                type: 'button'
            });

            settingsButton.addEventListener('click', () => {
                window.location.href = '/app/account/settings';
            });

            themeContainer.insertBefore(settingsButton, loggedInDetails);
        }

        const icon = createElement('img', {
            src: user.user.thumbnail,
            alt: 'User Icon',
            id: 'loggedInIcon'
        });

        icon.onerror = () => {
            if (icon.src !== '/app/assets/default-roblox-profile.png') {
                icon.src = '/app/assets/default-roblox-profile.png';
            }
        };

        const name = createElement('span', {
            innerText: user.user.name,
            id: 'loggedInName'
        });

        addChild(loggedInDetails, [icon, name]);

        addClass(loggedInDetails, 'loggedIn');

        if (user.mod === true) {
            const link = createElement('a', {
                href: '/app/mods/mod-panel',
                innerText: 'Mod Panel'
            });
            addChild(menuBar, link);
        }

        if (user.admin === true) {
            const link = createElement('a', {
                href: '/app/admin/admin-panel',
                innerText: 'Admin Panel'
            });
            addChild(menuBar, link);
        }
    } else {
        const button = createElement('button', {
            id: 'loginButton',
            innerHTML: `${getWebIconHTML('person')} Login`,
            type: 'button'
        });
        button.addEventListener('click', () => {
            sessionStorage.setItem('LoginRedirect', window.location.href);
            window.location.href = '/login';
        });

        addChild(loggedInDetails, button);

        if (getPageFileName() === 'captcha') loggedInDetails.innerHTML = '';
    }
}

/**
 * Handle a login redirect if needed.
 */
export function handleLoginRedirect() {
    const url = new URL(window.location.href);
    const redirect = url.searchParams.get('loginRedirect');
    if (redirect === 'true') {
        const loginRedirect = sessionStorage.getItem('LoginRedirect') as string;
        try {
            const newURL = new URL(loginRedirect);
            if (url.hostname === newURL.hostname) {
                window.location.href = newURL.href;
            }
            sessionStorage.removeItem('LoginRedirect');
        } catch (error) {
            console.error(error);
            const url = new URL(window.location.href);
            url.searchParams.delete('loginRedirect');
            window.history.replaceState({}, '', url.href);
        }
    }
}
