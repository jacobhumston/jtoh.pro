import { getLoggedInUser } from '../libs/auth';
import { addChild, createElement, getElementByIdExpected, getWebIconHTML, waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const container = getElementByIdExpected('accountSettingsContainer', 'div');
    if (!container) return;

    const account = await getLoggedInUser();

    container.innerHTML = '';

    if (!account.user) return (container.innerHTML = '<p>You must be logged in to use this page!</p>');

    addChild(container, [
        createElement('h2', { innerText: 'General Actions', className: 'accountSettingsHeader' }),
        createElement('div', {}, ['split', 'accountSettingsSplit'])
    ]);

    const logoutButton = createElement('button', { innerHTML: getWebIconHTML('logout') + ' Logout', type: 'button' });
    const switchAccountsButton = createElement('button', {
        innerHTML: getWebIconHTML('switch_account') + ' Switch Accounts',
        type: 'button'
    });

    addChild(container, [logoutButton, switchAccountsButton]);

    logoutButton.addEventListener('click', async () => {
        window.location.href = '/logout';
    });

    switchAccountsButton.addEventListener('click', async () => {
        sessionStorage.setItem('LoginRedirect', window.location.href);
        window.location.href = '/logout?switch=true';
    });
}
