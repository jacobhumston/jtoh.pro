/**
 * This file manages client side theming.
 * It also handle's theme toggling.
 *
 * Authored by Jacob Humston
 */

/**
 * Returns a boolean indicating whether the client should be using
 * dark mode or not.
 * @returns A boolean indicating if dark mode should be used.
 */
export function darkModeEnabled(): boolean {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkEnabled = localStorage.getItem('darkModeEnabled') === 'true';
    const lightEnabled = localStorage.getItem('darkModeEnabled') === 'false';
    const useDarkMode = (prefersDark || darkEnabled) && !lightEnabled;
    return useDarkMode;
}

/**
 * Apply the current theme.
 */
export function applyTheme(): undefined {
    const root = document.documentElement;
    const useDarkMode = darkModeEnabled();
    root.toggleAttribute('dark', useDarkMode);
    localStorage.setItem('colorMode', useDarkMode ? 'dark' : 'light');
}

/**
 * Set the current theme.
 * @param useDarkMode A boolean indicating whether the theme should be dark mode or light mode.
 */
export function setTheme(useDarkMode: boolean) {
    const root = document.documentElement;
    root.toggleAttribute('dark', useDarkMode);
    localStorage.setItem('darkModeEnabled', useDarkMode ? 'true' : 'false');
    localStorage.setItem('colorMode', useDarkMode ? 'dark' : 'light');
}

/**
 * Listen for them switches.
 * This function also handles the visual state of the theme switcher.
 */
export function listenForThemeSwitches() {
    const themeSwitcher = document.getElementById('themeSwitcher');
    if (!themeSwitcher || !(themeSwitcher instanceof HTMLButtonElement))
        return console.log('Theme switcher is missing.');

    const themeElements = themeSwitcher.children;
    // [0] - theme switcher background
    // [1] - light icon
    // [2] - dark icon

    /**
     * Update the theme switcher's ui state.
     */
    function updateUI() {
        const isDark = darkModeEnabled();
        isDark ? themeElements[0].classList.add('dark') : themeElements[0].classList.remove('dark');
        themeElements[1].classList[isDark ? 'remove' : 'add']('currentTheme');
        themeElements[2].classList[isDark ? 'add' : 'remove']('currentTheme');
    }

    themeSwitcher.addEventListener('click', function () {
        const useDark = !darkModeEnabled();
        setTheme(useDark);
        updateUI();
    });

    updateUI();
}
