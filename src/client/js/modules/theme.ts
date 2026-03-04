/**
 * This file manages client side theming.
 * It also handle's theme toggling.
 *
 * Authored by Jacob Humston
 */
import type { ThemeConfig } from 'chartgpu';
import Color from 'color';
import { Evt } from 'evt';

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
    themeEvents.post('updated');
}

/**
 * Set the current theme.
 * @param useDarkMode A boolean indicating whether the theme should be dark mode or light mode.
 */
export function setTheme(useDarkMode: boolean) {
    localStorage.setItem('darkModeEnabled', useDarkMode ? 'true' : 'false');
    applyTheme();
}

/**
 * Listen for theme switches.
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
        if (isDark) themeElements[0].classList.add('dark');
        else themeElements[0].classList.remove('dark');
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

/** Theme events */
export const themeEvents = Evt.create<'updated'>();

/**
 * A simple function that uses {@linkcode darkModeEnabled} to get
 * the current theme. Which is either `light` or `dark`.
 * @returns The current theme.
 */
export function getCurrentTheme(): 'light' | 'dark' {
    return darkModeEnabled() ? 'dark' : 'light';
}

/**
 * Get the current chart theme.
 * @returns The current chart theme config.
 */
export function getCurrentChartTheme(): ThemeConfig {
    const style = getComputedStyle(document.documentElement);

    // quick function refrence to make code easier to read
    // "p" :skull: - best named variable of 2025
    const p = style.getPropertyValue.bind(style);
    return {
        backgroundColor: p('--background-darker'),
        textColor: p('--text'),
        axisLineColor: p('--text-darker'),
        axisTickColor: p('--text-darker'),
        gridLineColor: new Color(p('--text-darker')).darken(0.5).hex(),
        colorPalette: [p('--accent'), p('--red'), p('--green'), p('--blue'), p('--yellow')],
        fontFamily: 'Poppins',
        fontSize: 12
    };
}
