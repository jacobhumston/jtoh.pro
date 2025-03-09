import { getLoggedInUser } from '../libs/auth';
import { createErrorPopup } from '../libs/quickElements';
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

    addChild(container, [
        createElement('h2', { innerText: 'Card Background Photo', className: 'accountSettingsHeader' }),
        createElement('div', {}, ['split', 'accountSettingsSplit']),
        createElement(
            'p',
            {
                innerHTML: 'This is the photo that will be used as the background of your card.'
            },
            [],
            [
                createElement('br'),
                createElement('a', {
                    innerText: "Click here to change your card's background photo.",
                    href: '/app/account/card-backgrounds'
                })
            ]
        )
    ]);

    const currentCardImageContainer = createElement('div', { innerHTML: '<p>Loading...</p>' });
    addChild(container, [currentCardImageContainer]);

    (async () => {
        const cardBackground = await (
            await fetch('/api/account/card-background').catch(() => ({
                json: async () => {
                    createErrorPopup('Failed to load card background photo.', false);
                    return { result: null };
                }
            }))
        ).json();

        if (cardBackground.result) {
            currentCardImageContainer.innerHTML = '';
            const currentCardImage = createElement('img', { id: 'currentCardImage' });
            currentCardImage.src = cardBackground.result.webPath;
            addChild(currentCardImageContainer, [currentCardImage]);
        } else {
            currentCardImageContainer.innerHTML = '';
            addChild(currentCardImageContainer, [
                createElement('p', {
                    innerHTML: 'You have not set a card background photo yet. Click the link above to set one.'
                })
            ]);
        }
    })();
}
