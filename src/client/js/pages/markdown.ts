/**
 * This script handles every page which is sourced from markdown.
 *
 * Authored by Jacob Humston
 */
import { contentBoxSize, contentSize, inView } from '@jsfns/web';
import { normalizeName } from 'normalize-text';
import slugify from 'slugify';

window.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('h1');
    if (header) document.title = `jtoh.pro - ${normalizeName(header.innerText)}`;

    const allHeaders = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const textNavigation = document.getElementById('textNavigation');

    if (!textNavigation) return console.warn('textNavigation is missing!');

    if (allHeaders.length <= 1) {
        textNavigation.style.display = 'none';
        return;
    }

    const headerSelects: Array<HTMLAnchorElement> = [];
    for (const header of allHeaders) {
        header.id = slugify(header.innerHTML, { lower: true, strict: true });

        const headerSelect = document.createElement('a');
        headerSelect.href = `#${header.id}`;
        headerSelect.innerHTML = header.innerHTML;

        textNavigation.insertAdjacentElement('beforeend', headerSelect);
        headerSelects.push(headerSelect);
    }

    function updateUI() {
        for (const a of headerSelects) {
            a.classList.remove('selectedAnchor');
        }

        let lastSelectedHeader: Element | null = null;
        let lastSelectedHeaderAnchor: HTMLAnchorElement | null = null;

        for (const [index, value] of allHeaders.entries()) {
            if (lastSelectedHeader) continue;
            if (inView(value as HTMLElement).inside) {
                lastSelectedHeader = value;
                lastSelectedHeaderAnchor = headerSelects[index];
            }
        }

        if (lastSelectedHeader && lastSelectedHeaderAnchor) {
            lastSelectedHeaderAnchor.classList.add('selectedAnchor');
            //history.replaceState({}, "", `#${lastSelectedHeader.id}`)
        }
    }

    window.addEventListener('scroll', updateUI);
    updateUI();

    if (contentSize(textNavigation).height > contentBoxSize(window).height) textNavigation.style.position = 'relative';
});
