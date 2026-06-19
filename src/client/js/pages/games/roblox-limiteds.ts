/**
 * Roblox limited collection game script.
 *
 * Authored by Jacob Humston
 */

import { domReady } from '@jsfns/web';

import { client } from '@client/modules/api';
import { getRobloxAuthInfo } from '@client/modules/auth';
import { getCaptchaToken } from '@client/modules/captcha';
import { createElement, downloadBlob, getIconHTML } from '@client/utils/elements';

declare global {
    var downloadCSV: () => void;
}

await new Promise((resolve) => domReady(() => resolve(0)));
const container = document.getElementById('container') as HTMLDivElement;
const stats = document.getElementById('stats') as HTMLParagraphElement;
const profileLink = document.getElementById('profileLink') as HTMLAnchorElement;
const formatter = Intl.NumberFormat();

if (!(await getRobloxAuthInfo())) {
    container.innerText = 'You must be logged in to use this page!';
} else {
    profileLink.href = `https://www.rolimons.com/player/${(await getRobloxAuthInfo())?.id}`;

    const limiteds = await client.GET('/api/roblox-limiteds', {
        params: { header: { captcha: await getCaptchaToken() } }
    });

    if (!limiteds.data) {
        container.innerText = 'Failed to fetch list of limiteds.';
    } else {
        const myLimiteds = await client.GET('/api/my-roblox-limiteds', {
            params: { header: { captcha: await getCaptchaToken() } }
        });
        if (!myLimiteds.data) {
            container.innerText = 'Failed to fetch your list of limiteds. Your inventory may be private.';
        } else {
            container.innerHTML = '';
            const sortedLimiteds = limiteds.data.toSorted((a, b) => a.rap - b.rap).filter((i) => i.rap > 0);
            const ownedItems = Object.keys(myLimiteds.data);
            stats.innerHTML = `You own ${formatter.format(ownedItems.length)}/${formatter.format(limiteds.data.length)} limiteds.`;
            for (const limited of sortedLimiteds) {
                container.append(
                    createElement(
                        'div',
                        { className: 'limited', classes: ownedItems.includes(limited.id) ? ['owned'] : [] },
                        [
                            createElement('img', { className: 'image', src: limited.picture, alt: limited.name }),
                            createElement('p', {
                                className: 'name',
                                innerText: `${limited.name} ${(myLimiteds.data[limited.id] ?? 0) > 1 ? `(x${myLimiteds.data[limited.id]})` : ''}`
                            }),
                            createElement('a', {
                                className: 'open',
                                innerHTML: getIconHTML('open_in_new'),
                                href: `https://www.rolimons.com/item/${limited.id}`,
                                target: '_blank'
                            }),
                            createElement('p', {
                                className: 'rap',
                                innerText: `${formatter.format(limited.rap)} Robux`
                            })
                        ]
                    )
                );
            }

            globalThis.downloadCSV = () => {
                let str = 'Owned?,Name,RAP,Value,Link';
                str =
                    str +
                    '\n' +
                    sortedLimiteds
                        .map(
                            (l) =>
                                `${ownedItems.includes(l.id) ? 'Yes' : 'No'},"${l.name}","${formatter.format(l.rap)}","${formatter.format(l.value ?? 0)}","${`https://www.rolimons.com/item/${l.id}`}"`
                        )
                        .join('\n');
                downloadBlob('roblox-limiteds.csv', new Blob([str]));
            };
        }
    }
}
