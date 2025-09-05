import { document, window } from './global';
import { isDebounceActive, setDebounceActive, setDebounceInactive } from './debounce';
import { addClass, removeClass, getWebIconHTML, waitForElementById, wait } from './util';

/** Theme types. */
export type Themes = 'themesLight' | 'themesDark';

/**
 * Apply the theme based on the user's preference or the saved theme.
 */
export function applyTheme() {
    const root = document.documentElement;
    const localStorage = window.localStorage;
    const currentTheme = localStorage.getItem('theme') as Themes | null;
    if (!currentTheme) {
        addClass(root, 'themesDark');
    } else {
        addClass(root, currentTheme);
    }
}

/**
 * Update the theme based on the user's selection.
 * @param theme The theme to update to.
 */
export function updateTheme(theme: Themes) {
    const root = document.documentElement;
    const localStorage = window.localStorage;
    root.classList.forEach((value) => {
        if (value.startsWith('themes')) removeClass(root, value);
    });
    localStorage.setItem('theme', theme);
    applyTheme();
}

/**
 * Get the current theme.
 * @returns The current theme.
 */
export function getTheme(): Themes {
    const localStorage = window.localStorage;
    if (localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as Themes;
    }
    return 'themesDark';
}

/**
 * Listen for theme selection.
 * This also makes some tiny modifications to the logged in details, depending on the open state.
 */
export async function listenForThemSelection() {
    const themeChanger = await waitForElementById('themeChanger', { timeout: 10000, interval: 10 });
    if (!themeChanger) return;

    function updateIcon() {
        if (!themeChanger) return;
        const theme = getTheme();
        if (theme === 'themesLight') {
            themeChanger.innerHTML = getWebIconHTML('light_mode');
        } else if (theme === 'themesDark') {
            themeChanger.innerHTML = getWebIconHTML('dark_mode');
        }
    }

    themeChanger.addEventListener('click', async () => {
        if (isDebounceActive('themeChanger')) return;
        setDebounceActive('themeChanger');
        const currentTheme = getTheme();
        let nextTheme: Themes;
        if (currentTheme === 'themesDark') nextTheme = 'themesLight';
        else nextTheme = 'themesDark';
        updateTheme(nextTheme);
        updateIcon();
        await wait(500);
        setDebounceInactive('themeChanger');
    });

    updateIcon();
}
