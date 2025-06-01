import { addClass, wait, waitForElementById, waitForPageLoad } from '../libs/util';

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

    const themeContainer = await waitForElementById('themeContainer', { timeout: 5000, interval: 0 });
    if (!themeContainer) return;
    const update = () => {
        if (menuBar.scrollWidth > menuBar.clientWidth) {
            themeContainer.style.paddingTop = `10px`;
        } else {
            themeContainer.style.paddingTop = '';
        }
    };
    window.addEventListener('resize', update);
    await waitForPageLoad();
    await wait(100);
    update();

    // Just for the sake of it, update the menu again.
    setTimeout(update, 3000);
    setTimeout(() => {
        for (const link of menuBarLinks) {
            if (new URL(link.href).pathname === new URL(window.location.href).pathname) {
                addClass(link, 'menuBarActive');
            }
        }
    }, 3000);
}
