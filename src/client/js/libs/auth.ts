import { createErrorPopup } from './quickElements';
import { getElementById, getPageFileName, waitForElementById, createElement, addChild, addClass } from './util';

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
};

let user: null | LoggedInUser = null;

/**
 * Checks if a user is logged in and updates internal state.
 */
export async function checkAuth() {
    if (user) return user;
    const response = await fetch('/api/auth/@me').catch(() => ({
        json: () => ({ user: null, admin: false }),
        status: 200
    }));
    if (response.status === 200) {
        const data: LoggedInUser = await response.json();
        user = data;
    } else {
        createErrorPopup('Failed to check for a logged in user.', 4000);
        user = { user: null, admin: false };
    }
}

/**
 * Get the logged in user.
 * @returns The logged in user.
 */
export async function getLoggedInUser(): Promise<LoggedInUser> {
    await checkAuth();
    if (!user) return { user: null, admin: false };
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
    const loggedInDetails = await waitForElementById('loggedInDetails', { timeout: 2000 });
    if (!loggedInDetails) return;

    const user = await getLoggedInUser();
    if (user.user) {
        const menuBar = getElementById('menuBar');
        if (!menuBar) return;

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

        addChild(loggedInDetails, icon);

        const name = createElement('span', {
            innerText: user.user.name,
            id: 'loggedInName'
        });

        addChild(loggedInDetails, name);

        addClass(loggedInDetails, 'loggedIn');

        if (user.admin === true) {
            const link = createElement('a', {
                href: '/app/admin/admin-panel',
                innerText: 'Admin Panel'
            });
            addChild(menuBar, link);
        }
    } else {
        loggedInDetails.innerHTML = '<a id="loginButton" href="/login">Login</a>';
        if (getPageFileName() === 'captcha') loggedInDetails.innerHTML = '';
    }
}
