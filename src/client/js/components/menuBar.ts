import { addClass, waitForElementById } from '../libs/util';

export async function updateMenuBar() {
    const menuBar = await waitForElementById('menuBar', { timeout: 5000 });
    if (!menuBar) return;
    const menuBarLinks = menuBar.getElementsByTagName('a');
    for (const link of menuBarLinks) {
        if (new URL(link.href).pathname === new URL(window.location.href).pathname) {
            addClass(link, 'menuBarActive');
        }
    }
}
