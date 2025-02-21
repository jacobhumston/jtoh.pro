import { addClass } from './util.ts';

export function applyTheme() {
    const root = document.documentElement;
    const localStorage = window.localStorage;
    const currentTheme = localStorage.getItem('theme');
    const prefersLightMode = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (!currentTheme) {
        prefersLightMode ? addClass(root, 'themesLight') : addClass(root, 'themesDark');
    } else {
        addClass(root, currentTheme);
    }
}
