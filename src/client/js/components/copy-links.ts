import { document, window } from '../libs/global';
import { isDebounceActive, setDebounceActive, setDebounceInactive } from '../libs/debounce';
import {
    addClass,
    copyTextToClipboard,
    genUUID,
    getWebIconHTML,
    removeClass,
    temporarilySetElementText,
    wait,
    waitForPageLoad
} from '../libs/util';

/**
 * Handle copying links.
 */
export async function handleCopyLinks() {
    await waitForPageLoad();

    const copyLinks = document.getElementsByClassName('smallCopyButton') as HTMLCollectionOf<HTMLButtonElement>;
    const currentURL = new URL(window.location.href);

    for (const button of copyLinks) {
        let url = button.dataset.url;
        if (!url) {
            console.warn('No URL found for copy button.');
            continue;
        }

        url = url.replaceAll('{{origin}}', currentURL.origin);
        const debounceId = 'copyLinkButton-' + genUUID();

        button.addEventListener('click', async () => {
            if (isDebounceActive(debounceId)) return;
            setDebounceActive(debounceId);
            const success = await copyTextToClipboard(url);
            if (success) {
                const reset = temporarilySetElementText(button, getWebIconHTML('check') + ' Copied!');
                addClass(button, 'successButton');
                await wait(1000);
                reset();
                removeClass(button, 'successButton');
            } else {
                const reset = temporarilySetElementText(button, getWebIconHTML('error') + ' Failed!');
                await wait(1000);
                reset();
            }
            setDebounceInactive(debounceId);
        });
    }
}
