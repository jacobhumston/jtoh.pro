import { addChild, createElement, getElementByIdExpected, waitForElementById } from '../../client/js/libs/util';
import { gameNamesArray, type gameNames } from '../../shared/gamelist';

// @ts-expect-error
if (globalThis.jtohPro !== undefined) {
    throw new Error('JToH Pro Embed: This script has already been loaded.');
}

// @ts-expect-error
globalThis.jtohProEmbed = {
    new: async (elementId: string) => {
        function prefixId(id: string) {
            return `jtoh-pro-${id}`;
        }

        function error(message: string) {
            return new Error(`JToH Pro Embed: ${message}`);
        }

        if (window === undefined) throw error('This script is meant to be run in a browser context.');

        if (globalThis.altchaCreateWorker === undefined && globalThis.altchaPlugins === undefined) {
            await import('altcha');
        } else {
            console.log('JToH Pro Embed: Captcha already loaded, skipping...');
        }

        const element = getElementByIdExpected(elementId, 'div');
        if (!element) throw error(`Element with ID ${elementId} not found`);

        const container = createElement('div', {}, prefixId('container'));
        const image = createElement('img', { alt: 'jtoh.pro Card' }, prefixId('image'));
        const info = createElement(
            'i',
            { innerHTML: 'Statistics card provided by <a href="https://jtoh.pro" target="_blank">jtoh.pro</a>.' },
            prefixId('info')
        );
        const captchaContainer = createElement('div', {}, prefixId('captcha-container'));

        addChild(container, [image, info]);

        function getCaptchaToken(): Promise<string | undefined> {
            return new Promise(async (resolve) => {
                captchaContainer.innerHTML =
                    '<altcha-widget challengeurl="{{URL}}/api/embeddable/get-captcha" hidelogo hidefooter></altcha-widget>';
                const clicker = await waitForElementById('altcha_checkbox', {});
                document.querySelector('altcha-widget')?.addEventListener('statechange', (ev) => {
                    // @ts-expect-error
                    if (ev.detail.state === 'verified') {
                        captchaContainer.innerHTML = '';
                        // @ts-expect-error
                        resolve(ev.detail.payload);
                    }
                });
                clicker?.click();
            });
        }

        addChild(element, [container, captchaContainer]);

        const functions = {
            set: async (usernameOrId: string | number, game: gameNames, urlSuffix?: string) => {
                const username = typeof usernameOrId === 'number' ? `!${usernameOrId}` : usernameOrId;
                if (!gameNamesArray.includes(game)) throw error(`Game "${game}" is not supported`);
                const token = await getCaptchaToken();
                image.src = `{{URL}}/api/embeddable/get-image/${game}/${username}?captcha=${token}${urlSuffix ? `&${urlSuffix}` : ''}`;
            },
            delete: () => {
                container.remove();
            }
        };

        return functions;
    }
};
