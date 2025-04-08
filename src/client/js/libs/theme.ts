import { addClass, removeClass, getWebIconHTML, getElementById, waitForElementById } from './util';

/**
 * Apply the theme based on the user's preference or the saved theme.
 */
export function applyTheme() {
    const root = document.documentElement;
    const localStorage = window.localStorage;
    const currentTheme = localStorage.getItem('theme');
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
export function updateTheme(theme: string) {
    const root = document.documentElement;
    const localStorage = window.localStorage;
    root.classList.forEach((value) => {
        if (value.startsWith('themes')) removeClass(root, value);
    });
    addClass(root, theme);
    localStorage.setItem('theme', theme);
}

/**
 * Listen for theme selection.
 * This also makes some tiny modifications to the logged in details, depending on the open state.
 */
export async function listenForThemSelection() {
    const themeChangeOpener = await waitForElementById('themeChangeOpener', { timeout: 10000 });
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
                updateTheme(theme.dataset.theme ?? '');
            });
        }
        if (enabled) {
            themeChangeOpener.innerHTML = `${getWebIconHTML('visibility_off')}`;
            if (loggedInName) loggedInName.style.display = 'none';
            if (loggedInDetails) loggedInDetails.style.paddingRight = '0px';
        } else {
            themeChangeOpener.innerHTML = `${getWebIconHTML('brush')}`;
            if (loggedInName) loggedInName.style.display = '';
            if (loggedInDetails) loggedInDetails.style.paddingRight = '';
        }
    });
}
