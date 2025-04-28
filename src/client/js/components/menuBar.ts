import { addClass, wait, waitForElementById } from '../libs/util';

/**
 * Apply menu bar modifications.
 */
export async function updateMenuBar() {
    const menuBar = await waitForElementById('menuBar', { timeout: 5000, interval: 0 });
    if (!menuBar) return;
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
}
