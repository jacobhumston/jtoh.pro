import { getLoggedInUser } from '../libs/auth';
import { isDebounceActive, setDebounceActive, setDebounceInactive } from '../libs/debounce';
import { createErrorPopup } from '../libs/quick-elements';
import { getWebToken } from '../libs/security';
import {
    addChild,
    createElement,
    getElementById,
    getElementByIdExpected,
    getWebIconHTML,
    temporarilySetElementText,
    wait,
    waitForPageLoad
} from '../libs/util';

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

    const generalControlsDescription = createElement('p', {
        innerHTML: `Logging out will log you out of all other sessions as well. To logout only on this session, please ${createElement('a', { innerHTML: 'click here', href: '/logout?single=true' }).outerHTML}.`
    });

    addChild(container, [logoutButton, switchAccountsButton, generalControlsDescription]);

    logoutButton.addEventListener('click', async () => {
        window.location.href = '/logout';
    });

    switchAccountsButton.addEventListener('click', async () => {
        sessionStorage.setItem('LoginRedirect', window.location.href);
        window.location.href = '/logout?switch=true&single=true';
    });

    addChild(container, [
        createElement('h2', { innerText: 'Card Background Photo', className: 'accountSettingsHeader' }),
        createElement('div', {}, ['split', 'accountSettingsSplit']),
        createElement('a', {
            innerHTML: `${getWebIconHTML('image')} Click here to change your card's background photo.`,
            href: '/app/account/card-backgrounds',
            id: 'clickHereToChangeCardBackground'
        }),
        createElement('p', {
            innerHTML: 'This is the photo that will be used as the background of your card.',
            id: 'cardBackgroundThisPhotoWillBeUsedParagraph'
        })
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
                    innerHTML: 'You have not set a card background photo yet. Click the button above to set one.'
                })
            ]);
            const p = getElementById('cardBackgroundThisPhotoWillBeUsedParagraph');
            if (p) p.remove();
        }
    })();

    addChild(container, [
        createElement('h2', { innerText: 'Account Data', className: 'accountSettingsHeader' }),
        createElement('div', {}, ['split', 'accountSettingsSplit'])
    ]);

    const downloadDataButton = createElement('button', {
        type: 'button',
        innerHTML: `${getWebIconHTML('folder_zip')} Download Account Data`
    });

    downloadDataButton.addEventListener('click', async () => {
        if (isDebounceActive('downloadData')) return;
        setDebounceActive('downloadData');
        const reset1 = temporarilySetElementText(
            downloadDataButton,
            getWebIconHTML('hourglass_empty') + 'Downloading...'
        );

        const token = await getWebToken();
        if (!token) document.location.reload();

        const link = createElement('a', {
            download: 'account-data.zip',
            href: `/api/account/download-data?captcha=${token}`
        });
        link.click();

        reset1();
        const reset2 = temporarilySetElementText(downloadDataButton, getWebIconHTML('check') + 'Done!');
        await wait(2000);
        reset2();
        setDebounceInactive('downloadData');
        link.remove();
    });

    addChild(container, [
        downloadDataButton,
        createElement(
            'p',
            { innerText: 'Use the button above to download your account data.' },
            [],
            [
                createElement(
                    'span',
                    {
                        innerHTML:
                            getWebIconHTML('warning') +
                            'The information found in your account data should NOT be shared with anyone.'
                    },
                    ['dangerInfoBox']
                )
            ]
        )
    ]);

    addChild(container, [
        createElement('h2', { innerText: 'Account Punishments', className: 'accountSettingsHeader' }),
        createElement('div', {}, ['split', 'accountSettingsSplit']),
        createElement(
            'p',
            {
                innerText:
                    'Account punishments are restrictions placed by staff members which prevent you from completing specific actions. These restrictions are only placed on users who violate our guidelines.'
            },
            []
        )
    ]);

    const punishments = await await fetch('/api/account/punishments')
        .then((res) => res.json())
        .catch(() => ({
            result: []
        }));

    if (punishments.result.length === 0) {
        addChild(container, [
            createElement('p', {
                innerText: 'You have no account punishments at this time. This means your account is in good standing!',
                id: 'accountSettingsNoPunishments'
            })
        ]);
    } else {
        const punishmentsList = createElement('div', { id: 'accountSettingsPunishmentsList' });
        addChild(container, [punishmentsList]);

        for (const punishment of punishments.result) {
            const punishmentItem = createElement('div', {
                innerHTML: `<span class="accountSettingsPunishmentType">${getWebIconHTML('warning')} ${punishment.punishmentType}</span> - ${punishment.reason}`,
                className: 'accountSettingsPunishmentItem'
            });
            if (punishment.expires) {
                punishmentItem.innerHTML += `<br><span class="accountSettingsPunishmentExpires">Expires on ${new Date(punishment.expires).toLocaleString()}</span>`;
            } else {
                punishmentItem.innerHTML += `<br><span class="accountSettingsPunishmentExpires">This punishment does not expire.</span>`;
            }
            addChild(punishmentsList, [punishmentItem]);
        }
    }
}
