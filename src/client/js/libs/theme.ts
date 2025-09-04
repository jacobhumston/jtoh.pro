import { document, window } from './global';
import { isDebounceActive } from './debounce';
import { addClass, removeClass, getWebIconHTML, getElementById, waitForElementById } from './util';

/** Theme types. */
export type Themes = 'themesLight' | 'themesDark' | 'themesGlass';

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
    const themeChangeOpener = await waitForElementById('themeChangeOpener', { timeout: 10000 });
    const settingsOpener = getElementById('settingsOpener');
    if (!themeChangeOpener) return;

    let enabled = false;
    themeChangeOpener.addEventListener('click', () => {
        enabled = !enabled;
        const themes = document.getElementsByClassName('themeChanger') as HTMLCollectionOf<HTMLElement>;
        const loggedInName = getElementById('loggedInName');
        const loggedInDetails = getElementById('loggedInDetails');
        for (const theme of themes) {
            theme.dataset.enabled = enabled.toString();
            theme.addEventListener('click', () => {
                if (isDebounceActive('themeChanger')) return;
                const ThisTheme = (theme.dataset.theme ?? '') as Themes;
                updateTheme(ThisTheme);
            });
        }
        if (enabled) {
            themeChangeOpener.innerHTML = `${getWebIconHTML('visibility_off')}`;
            themeChangeOpener.style.borderRadius = '100%';

            if (loggedInName) loggedInName.style.display = 'none';
            if (loggedInDetails) loggedInDetails.style.paddingRight = '0px';

            if (settingsOpener) {
                settingsOpener.style.borderRadius = '100%';
                settingsOpener.innerHTML = `${getWebIconHTML('settings')}`;
            }
        } else {
            themeChangeOpener.innerHTML = `${getWebIconHTML('brush')} Theme`;
            themeChangeOpener.style.borderRadius = '';

            if (loggedInName) loggedInName.style.display = '';
            if (loggedInDetails) loggedInDetails.style.paddingRight = '';

            if (settingsOpener) {
                settingsOpener.style.borderRadius = '';
                settingsOpener.innerHTML = `${getWebIconHTML('settings')} Settings`;
            }
        }
    });
}
