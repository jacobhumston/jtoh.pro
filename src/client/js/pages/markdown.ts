/**
 * This script handles every page which is sourced from markdown.
 *
 * Authored by Jacob Humston
 */
import { normalizeName } from 'normalize-text';

window.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('h1');
    if (header) {
        document.title = `jtoh.pro - ${normalizeName(header.innerText)}`;
    }
});
