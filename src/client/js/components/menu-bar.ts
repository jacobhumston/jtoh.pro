import { waitForAuthUI } from '../libs/auth';
import { isDebounceActive, setDebounceActive, setDebounceInactive } from '../libs/debounce';
import { window } from '../libs/global';
import {
    addChild,
    addClass,
    checkOverflow,
    getWebIconHTML,
    removeClass,
    wait,
    waitForElementById,
    waitForFonts,
    waitForPageLoad
} from '../libs/util';

/**
 * Apply menu bar modifications.
 */
export async function updateMenuBar() {
    await waitForPageLoad();
    await waitForAuthUI();
    await waitForFonts(); // font icons mess up the calculations when they are not loaded yet

    const menuBar = await waitForElementById('menuBar', { timeout: 5000, interval: 0 });
    const menuBarDropdown = await waitForElementById('menuBarDropdown', { timeout: 5000, interval: 0 });
    const menuBarExtraToggle = await waitForElementById('menuBarExtraToggle', { timeout: 5000, interval: 0 });

    if (!menuBar || !menuBarDropdown || !menuBarExtraToggle) return;

    const menuBarLinks = menuBar.getElementsByTagName('a');
    if (!menuBarLinks || menuBarLinks.length === 0) {
        await wait(100);
        return updateMenuBar();
    }
    for (const link of menuBarLinks) {
        if (new URL(link.href).pathname === new URL(window.location.href).pathname) {
            addClass(link, 'menuBarActive');
        }
    }

    const links = Array.from(menuBarLinks);
    const linksMap = new Map<HTMLElement, HTMLElement>();
    for (const link of links) {
        const clone = link.cloneNode(true) as HTMLElement;
        addChild(menuBarDropdown, clone);
        linksMap.set(link, clone);
    }

    async function updateMenuBarDropdown() {
        if (!menuBarExtraToggle || !menuBar || !menuBarDropdown) return;
        let somethingOverlapped = false;

        for (const link of links) {
            link.style.display = '';
        }

        for (const link of links.reverse()) {
            const clonedLink = linksMap.get(link);
            if (!clonedLink) throw 'Original link missing.';
            const overflow = checkOverflow(link);
            if (overflow.any) {
                somethingOverlapped = true;
                clonedLink.style.display = '';
                link.style.display = 'none';
            } else {
                clonedLink.style.display = 'none';
                link.style.display = '';
            }
            await wait(0);
        }

        if (somethingOverlapped) {
            menuBarExtraToggle.style.display = '';
        } else {
            menuBarExtraToggle.style.display = 'none';
            menuBarDropdown.style.display = 'none';
            removeClass(menuBar, 'menuBarDropdownOpened');
            menuBarExtraToggle.innerHTML = getWebIconHTML('menu');
            menuBarExtraToggle.style.color = '';
        }
    }

    menuBarExtraToggle.addEventListener('click', async () => {
        if (isDebounceActive('toggleExtraMenuBar')) return;
        setDebounceActive('toggleExtraMenuBar');
        if (menuBarDropdown.style.display === 'none') {
            menuBarDropdown.style.display = '';
            addClass(menuBar, 'menuBarDropdownOpened');
            menuBarExtraToggle.innerHTML = getWebIconHTML('close');
            menuBarExtraToggle.style.color = 'var(--red)';
        } else {
            menuBarDropdown.style.display = 'none';
            removeClass(menuBar, 'menuBarDropdownOpened');
            menuBarExtraToggle.innerHTML = getWebIconHTML('menu');
            menuBarExtraToggle.style.color = '';
        }
        await wait(200);
        setDebounceInactive('toggleExtraMenuBar');
    });

    updateMenuBarDropdown();
    window.addEventListener('resize', async () => {
        if (isDebounceActive('menuBarResize')) return;
        setDebounceActive('menuBarResize');
        await wait(1000);
        updateMenuBarDropdown();
        setDebounceInactive('menuBarResize');
    });
}
