import { document, window } from '../libs/global';
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
    stringToColorHex,
    temporarilySetElementText,
    wait,
    waitForPageLoad
} from '../libs/util';
import { Chart, registerables } from 'chart.js';
import { log } from '../libs/logger';
import { numberFormatter } from '../libs/formatters';
import Color from 'color';

Chart.register(...registerables);
Chart.defaults.font.family = 'Poppins';

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
    const logoutAllSessionsButton = createElement('button', {
        innerHTML: getWebIconHTML('logout') + ' Logout All Sessions',
        type: 'button',
        className: 'dangerButton'
    });
    const switchAccountsButton = createElement('button', {
        innerHTML: getWebIconHTML('switch_account') + ' Switch Accounts',
        type: 'button'
    });

    addChild(container, [logoutButton, switchAccountsButton, logoutAllSessionsButton]);

    logoutButton.addEventListener('click', async () => {
        window.location.href = '/logout?single=true';
    });

    logoutAllSessionsButton.addEventListener('click', async () => {
        window.location.href = '/logout';
    });

    switchAccountsButton.addEventListener('click', async () => {
        window.sessionStorage.setItem('LoginRedirect', window.location.href);
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

    const viewableRefs = await (await fetch(account.admin ? '/api/refs/list' : '/api/refs/viewable')).json();
    if (viewableRefs.codes.length > 0) {
        log('success', `User can view the following referral codes: ${viewableRefs.codes.join(', ')}`);

        addChild(container, [
            createElement('h2', { innerText: 'Referral Codes', className: 'accountSettingsHeader' }),
            createElement('div', {}, ['split', 'accountSettingsSplit']),
            createElement(
                'p',
                {
                    innerText:
                        'Referral codes allow you to track how many clicks your links have received. All codes you have access to view are listed below. Please contact our partnership email for assistance.'
                },
                []
            )
        ]);

        const referralCodesList = createElement('div', { id: 'accountSettingsReferralCodesList' });
        addChild(container, [referralCodesList]);

        for (const code of viewableRefs.codes) {
            const data = await (await fetch(`/api/refs/stats/${code}`)).json();

            const codeItem = createElement('div', { className: 'accountSettingsReferralCodeItem' });
            const codeHeader = createElement('h3', {
                innerHTML: `${getWebIconHTML('star')} ${code}`,
                className: 'accountSettingsReferralCodeHeader'
            });
            const overview = createElement('p', {
                className: 'accountSettingsReferralStats',
                innerHTML: `<b>Today:</b>  ${numberFormatter.format(data.stats.today)} <b>This Week:</b> ${numberFormatter.format(data.stats.week)} <b>This Month:</b> ${numberFormatter.format(data.stats.month)} <b>This Year:</b> ${numberFormatter.format(data.stats.year)} <b>Total:</b> ${numberFormatter.format(data.stats.total)}`
            });
            const chartCanvas = createElement('canvas', { className: 'accountSettingsReferralChart' });

            new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: data.data.map((x: any) =>
                        new Date(x.date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })
                    ),
                    datasets: [
                        {
                            label: `Clicks`,
                            data: data.data.map((x: any) => x.views),
                            fill: false,
                            tension: 0.1,
                            backgroundColor: stringToColorHex(code),
                            borderColor: new Color(stringToColorHex(code)).darken(0.2).hex(),
                            pointRadius: 3
                        }
                    ]
                },
                options: {
                    animation: false,
                    font: {
                        family: 'Poppins'
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ebebeb',
                                font: {
                                    family: 'Poppins'
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: `Daily Referrals - ${code}`,
                            color: '#ebebeb',
                            font: {
                                family: 'Poppins'
                            }
                        }
                    },
                    layout: {
                        padding: 10
                    },
                    scales: {
                        y: {
                            grid: {
                                color: '#828282'
                            },
                            ticks: {
                                color: '#ebebeb'
                            }
                        },
                        x: {
                            grid: {
                                color: '#828282'
                            },
                            ticks: {
                                color: '#ebebeb'
                            }
                        }
                    }
                }
            });

            addChild(codeItem, [codeHeader, chartCanvas, overview]);
            addChild(referralCodesList, [codeItem]);
        }
    }
}
