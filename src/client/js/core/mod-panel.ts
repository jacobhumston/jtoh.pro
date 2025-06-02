import { punishmentTypes, type ModLogEntry } from '../../../shared/punishment-types';
import { isDebounceActive, setDebounceActive, setDebounceInactive } from '../libs/debounce';
import {
    addChild,
    addClass,
    createElement,
    getElementById,
    getElementByIdExpected,
    getRobloxAccountDetails,
    removeClass,
    updatePageDisplayURL,
    waitForPageLoad
} from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const modContainer = getElementByIdExpected('modContainer', 'div');
    if (!modContainer) return console.error('Mod panel container not found.');

    const pagesSelectContainer = createElement(
        'div',
        { id: 'modPagesSelectContainer' },
        [],
        [createElement('p', { innerText: 'Available Pages' })]
    );
    const pagesSelectButtonContainer = createElement('div', { id: 'modPagesSelectButtonContainer' });
    addChild(pagesSelectContainer, pagesSelectButtonContainer);
    const pageContainer = createElement('div', { id: 'modPageContainer' });

    const pages: Array<{ title: string; update: () => Promise<any>; cleanUp: undefined | (() => Promise<any>) }> = [];

    let uploadCardBackgroundQueueTimer: Timer | undefined = undefined;
    pages.push({
        title: 'Card Uploads',
        update: async () => {
            addChild(pageContainer, [
                createElement('h2', { innerText: 'Card Uploads Queue' }),
                createElement('p', {
                    innerHTML:
                        'Card backgrounds that need to be reviewed by a mod are listed below. You can approve or reject them. Make sure they do not violate the <a href="/app/uploading-guidelines" target="_blank">Uploading Guidelines</a> before approving them. If you decline an upload, you will be redirected to the punishment page afterwards to issue a punishment if necessary.'
                })
            ]);

            async function fetchQueue(): Promise<Array<{ uploaderId: number; id: string; url: string }>> {
                return fetch('/api/mods/upload-card-background-queue')
                    .then((res) => res.json())
                    .then((data) => data.queue || [])
                    .catch(console.error);
            }

            const queueElementsContainer = createElement('div', { id: 'uploadCardBackgroundQueue' });
            addChild(pageContainer, queueElementsContainer);

            async function update() {
                const queue = (await fetchQueue()).reverse();
                for (const item of queue) {
                    const existingElement = getElementById(`uploadCardBackgroundQueueItem${item.uploaderId}`);
                    if (existingElement) continue;

                    const queueItem = createElement('div', {
                        id: `uploadCardBackgroundQueueItem${item.uploaderId}`,
                        className: 'uploadCardBackgroundQueueItem'
                    });
                    addChild(queueItem, [
                        createElement('p', {
                            innerHTML: `<b>Uploader:</b> ${(await getRobloxAccountDetails(`!${item.uploaderId}`))?.name} <code>${item.uploaderId}</code><br><b>Item ID:</b> <code>${item.id}</code><br><b>Item URL:</b> <a href="${item.url}" target="_blank">${item.url}</a>`
                        }),
                        createElement('img', {
                            alt: 'Card Background',
                            src: item.url
                        })
                    ]);

                    const approveButton = createElement(
                        'button',
                        {
                            innerText: 'Approve',
                            type: 'button'
                        },
                        ['uploadCardBackgroundQueueApproveItemButton']
                    );

                    const declineButton = createElement(
                        'button',
                        {
                            innerText: 'Decline',
                            type: 'button'
                        },
                        ['uploadCardBackgroundQueueDeclineItemButton']
                    );

                    approveButton.addEventListener('click', async () => {
                        if (isDebounceActive('modPanel')) return;
                        setDebounceActive('modPanel');

                        const response = await fetch(`/api/mods/upload-card-background-queue/approve/${item.id}`, {
                            method: 'POST'
                        }).then((res) => res.json());

                        if (response.error) {
                            console.error(response.error);
                            alert(`Failed to approve item: ${response.error}`);
                        } else {
                            queueItem.remove();
                        }

                        setDebounceInactive('modPanel');
                    });

                    declineButton.addEventListener('click', async () => {
                        if (isDebounceActive('modPanel')) return;
                        setDebounceActive('modPanel');

                        const reason = prompt('Please enter a reason for declining this item:');
                        if (!reason || reason.length > 2000) {
                            alert('Invalid reason. Please try again.');
                            setDebounceInactive('modPanel');
                            return;
                        }

                        const response = await fetch(
                            `/api/mods/upload-card-background-queue/remove/${item.id}?reason=${encodeURIComponent(reason)}`,
                            {
                                method: 'POST'
                            }
                        ).then((res) => res.json());

                        if (response.error) {
                            console.error(response.error);
                            alert(`Failed to decline item: ${response.error}`);
                        } else {
                            queueItem.remove();
                        }

                        document.location =
                            '/app/mods/mod-panel?page=Punishments&user=!' +
                            item.uploaderId +
                            '&type=UploadCardBackgroundBan&reason=' +
                            encodeURIComponent(reason);

                        setDebounceInactive('modPanel');
                    });

                    addChild(queueItem, [approveButton, declineButton]);

                    addChild(queueElementsContainer, queueItem);
                }
            }

            uploadCardBackgroundQueueTimer = setInterval(update, 10000);
            update();
        },
        cleanUp: async () => {
            if (uploadCardBackgroundQueueTimer) clearInterval(uploadCardBackgroundQueueTimer);
        }
    });

    pages.push({
        title: 'Punishments',
        update: async () => {
            addChild(pageContainer, [
                createElement('h2', { innerText: 'Punishments' }),
                createElement('p', { innerText: 'View and issue punishments.' })
            ]);

            const url = new URL(window.location.href);
            const user = url.searchParams.get('user');
            const type = url.searchParams.get('type');
            const reason = url.searchParams.get('reason');

            const punishContainer = createElement('div', { id: 'punishmentContainer' });
            const punishContainerFlex = createElement('div', { className: 'interactionFlex' });
            addChild(punishContainer, [createElement('h3', { innerText: 'Issue Punishment' }), punishContainerFlex]);

            const punishUserInput = createElement('input', { placeholder: '!<userid> or <username>', type: 'text' });
            const punishTypeInput = createElement('select', { id: 'punishmentTypeSelect' });
            punishmentTypes.forEach((punishmentType) => {
                const option = createElement('option', {
                    value: punishmentType,
                    innerText: punishmentType,
                    id: `punishmentTypeSelect${encodeURIComponent(punishmentType)}`
                });
                addChild(punishTypeInput, option);
            });
            const reasonInput = createElement('input', { placeholder: 'Reason for punishment', type: 'text' });
            const expiresInput = createElement('input', {
                placeholder: 'Expiration (optional, in days)',
                type: 'number'
            });
            const submitPunishmentButton = createElement('button', { innerText: 'Issue Punishment', type: 'button' });

            addChild(punishContainerFlex, [punishUserInput, punishTypeInput, reasonInput, expiresInput]);

            addChild(
                punishContainer,
                createElement('div', { className: 'interactionFlex' }, [], [submitPunishmentButton])
            );

            if (user) punishUserInput.value = user;
            if (type) {
                const option = getElementByIdExpected(`punishmentTypeSelect${encodeURIComponent(type)}`, 'option');
                if (option) option.selected = true;
            }
            if (reason) reasonInput.value = reason;

            submitPunishmentButton.addEventListener('click', async () => {
                if (isDebounceActive('modPanel')) return;
                setDebounceActive('modPanel');
                const userInput = punishUserInput.value.trim();
                const typeInput = punishTypeInput.value;
                const reasonInputValue = reasonInput.value.trim();
                let expiresInputValue = expiresInput.value.trim();

                const response = await fetch(
                    `/api/mods/punish/${encodeURIComponent(userInput)}?type=${typeInput}&reason=${encodeURIComponent(reasonInputValue)}&expires=${expiresInputValue}`,
                    {
                        method: 'POST'
                    }
                ).then((res) => res.json());
                if (response.error) {
                    console.error(response.error);
                    alert(`Failed to issue punishment: ${response.error}`);
                } else {
                    alert('Punishment issued successfully.');
                }
                setDebounceInactive('modPanel');
            });

            const viewPunishmentsContainer = createElement('div', { id: 'viewPunishmentsContainer' });
            const viewPunishmentsContainerFlex = createElement('div', { className: 'interactionFlex' });
            addChild(viewPunishmentsContainer, [
                createElement('h3', { innerText: 'View Punishments' }),
                viewPunishmentsContainerFlex
            ]);

            const punishmentListContainer = createElement('div', { id: 'punishmentListContainer' });
            const viewPunishmentsUserInput = createElement('input', {
                placeholder: '!<userid> or <username>',
                type: 'text'
            });
            const viewPunishmentsButton = createElement('button', { innerText: 'View Punishments', type: 'button' });

            addChild(viewPunishmentsContainerFlex, [viewPunishmentsUserInput, viewPunishmentsButton]);

            addChild(viewPunishmentsContainer, punishmentListContainer);

            viewPunishmentsButton.addEventListener('click', async () => {
                if (isDebounceActive('modPanel')) return;
                setDebounceActive('modPanel');

                const userInput = viewPunishmentsUserInput.value.trim();
                const response = await fetch(`/api/mods/punishments/${userInput}`)
                    .then((res) => res.json())
                    .catch(console.error);
                if (response.error) {
                    console.error(response.error);
                    alert(`Failed to fetch punishments: ${response.error}`);
                } else {
                    punishmentListContainer.innerHTML = '';
                    if (response.punishments.length === 0) {
                        addChild(
                            punishmentListContainer,
                            createElement('p', { innerText: 'No punishments found.', className: 'noPunishmentsListed' })
                        );
                    } else {
                        for (const punishment of response.punishments) {
                            const punishmentElement = createElement('div', { className: 'punishmentItem' });
                            const mod = await getRobloxAccountDetails(`!${punishment.modId}`);
                            addChild(
                                punishmentElement,
                                createElement('p', {
                                    innerHTML: `<b>Moderator:</b> ${mod?.name} <code>${punishment.modId}</code><br><b>Type:</b> ${punishment.type}<br><b>Reason:</b> ${punishment.reason}<br><b>Expires:</b> ${punishment.expires ? new Date(punishment.expires).toLocaleString() : 'Never'}`
                                })
                            );

                            const removeButton = createElement(
                                'button',
                                { innerText: 'Remove Punishment', type: 'button' },
                                ['removePunishmentButton']
                            );
                            removeButton.addEventListener('click', async () => {
                                if (isDebounceActive('modPanel')) return;
                                setDebounceActive('modPanel');
                                const reason = prompt('Please enter a reason for removing this punishment:');
                                if (!reason || reason.length > 2000) {
                                    alert('Invalid reason. Please try again.');
                                    setDebounceInactive('modPanel');
                                    return;
                                }
                                const removeResponse = await fetch(
                                    `/api/mods/remove-punishment/${userInput}?type=${punishment.type}&reason=${encodeURIComponent(reason)}`,
                                    {
                                        method: 'POST'
                                    }
                                ).then((res) => res.json());
                                if (removeResponse.error) {
                                    console.error(removeResponse.error);
                                    alert(`Failed to remove punishment: ${removeResponse.error}`);
                                } else {
                                    alert('Punishment removed successfully.');
                                    punishmentElement.remove();
                                }
                                setDebounceInactive('modPanel');
                            });

                            addChild(
                                punishmentElement,
                                createElement('div', { className: 'interactionFlex' }, [], [removeButton])
                            );
                            addChild(punishmentListContainer, punishmentElement);
                        }
                    }
                }
                setDebounceInactive('modPanel');
            });

            addChild(pageContainer, [punishContainer, viewPunishmentsContainer]);
        },
        cleanUp: undefined
    });

    pages.push({
        title: 'Lists',
        update: async () => {
            addChild(pageContainer, [
                createElement('h2', { innerText: 'Lists' }),
                createElement('p', {
                    innerText:
                        'List of leaderboard blacklists as well as the mod list can be found below. These lists can only be edited by LovelyJacob.'
                })
            ]);

            const lists: { lists: { mods: number[]; leaderboardBlacklist: number[] } } | undefined = await fetch(
                '/api/mods/lists'
            )
                .then((res) => res.json())
                .catch(console.error);
            if (!lists) {
                addChild(pageContainer, createElement('p', { innerText: 'Failed to fetch lists.' }));
            } else {
                const modList = lists.lists.mods;
                const leaderboardBlacklist = lists.lists.leaderboardBlacklist;

                if (modList.length === 0) {
                    addChild(pageContainer, createElement('p', { innerText: 'No mods found.' }));
                } else {
                    addChild(pageContainer, [
                        createElement('h3', { innerText: 'Mod List' }),
                        createElement('p', { innerText: 'The following users are mods:' })
                    ]);
                    const modListElement = createElement('ul');
                    for (const modId of modList) {
                        const mod = await getRobloxAccountDetails(`!${modId}`);
                        if (mod) {
                            addChild(
                                modListElement,
                                createElement('li', {
                                    innerHTML: `${createElement('img', { alt: 'User Profile', src: mod.thumbnail }).outerHTML} ${mod.name} <code>${modId}</code>`,
                                    className: 'modUserListElement'
                                })
                            );
                        }
                    }
                    addChild(pageContainer, modListElement);
                }

                if (leaderboardBlacklist.length === 0) {
                    addChild(pageContainer, createElement('p', { innerText: 'No leaderboard blacklists found.' }));
                } else {
                    addChild(pageContainer, [
                        createElement('h3', { innerText: 'Leaderboard Blacklist' }),
                        createElement('p', { innerText: 'The following users are blacklisted from all leaderboards:' })
                    ]);
                    const blacklistListElement = createElement('ul');
                    for (const userId of leaderboardBlacklist) {
                        const user = await getRobloxAccountDetails(`!${userId}`);
                        if (user) {
                            addChild(
                                blacklistListElement,
                                createElement('li', {
                                    innerHTML: `${createElement('img', { alt: 'User Profile', src: user.thumbnail }).outerHTML} ${user.name} <code>${userId}</code>`,
                                    className: 'modUserListElement'
                                })
                            );
                        }
                    }
                    addChild(pageContainer, blacklistListElement);
                }
            }
        },
        cleanUp: undefined
    });

    pages.push({
        title: 'Mod Log',
        update: async () => {
            addChild(pageContainer, [
                createElement('h2', { innerText: 'Mod Log' }),
                createElement('p', { innerText: 'Mod log entries are listed below, most recent are shown first.' })
            ]);

            const modLog: { logs: Array<ModLogEntry> } | undefined = await fetch('/api/mods/logs')
                .then((res) => res.json())
                .catch(console.error);

            if (!modLog || modLog.logs.length === 0) {
                addChild(pageContainer, createElement('p', { innerText: 'No mod log entries found.' }));
            } else {
                for (const entry of modLog.logs) {
                    const entryElement = createElement('div', { className: 'modLogEntry' });
                    const mod = await getRobloxAccountDetails(`!${entry.modId}`);
                    const user = await getRobloxAccountDetails(`!${entry.userId}`);
                    addChild(
                        entryElement,
                        createElement('p', {
                            innerHTML: `<b>Moderator:</b> ${mod?.name} <code>${entry.modId}</code> <i class="timestamp">${new Date(entry.timestamp).toLocaleString()}</i>`
                        })
                    );
                    addChild(
                        entryElement,
                        createElement('p', {
                            innerHTML: `<b>Effected User:</b> ${user?.name} <code>${entry.userId}</code><br> <b>Action:</b> ${entry.action} <br><b>Reason</b>: ${entry.reason}`
                        })
                    );
                    addChild(pageContainer, entryElement);
                }
            }
        },
        cleanUp: undefined
    });

    addChild(modContainer, [pagesSelectContainer, pageContainer]);

    let lastCleanUp: undefined | (() => Promise<any>) = undefined;
    let lastCurrentPageButton: HTMLButtonElement | undefined = undefined;

    for (const page of pages) {
        const button = createElement(
            'button',
            { innerText: page.title, id: `modPageButton${encodeURIComponent(page.title)}`, type: 'button' },
            ['modPageButton']
        );

        button.addEventListener('click', async () => {
            if (isDebounceActive('modPanel')) return;
            setDebounceActive('modPanel');

            if (lastCleanUp) await lastCleanUp();
            if (lastCurrentPageButton) removeClass(lastCurrentPageButton, 'modPageButtonActive');

            if (page.cleanUp) lastCleanUp = page.cleanUp;
            lastCurrentPageButton = button;
            addClass(button, 'modPageButtonActive');

            pageContainer.innerHTML = '';
            await page.update();

            updatePageDisplayURL(`/app/mods/mod-panel?page=${encodeURIComponent(page.title)}`);

            setDebounceInactive('modPanel');
        });

        addChild(pagesSelectButtonContainer, button);
    }

    addChild(pageContainer, createElement('p', { innerText: 'Select a page above to get started.' }));

    const url = new URL(window.location.href);
    const page = url.searchParams.get('page');
    if (page) {
        const targetPage = pages.find((p) => p.title === decodeURIComponent(page));
        if (targetPage) {
            const button = getElementByIdExpected(`modPageButton${encodeURIComponent(targetPage.title)}`, 'button');
            if (button) button.click();
        }
    }
}
