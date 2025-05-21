import { getElementById, createElement, addChild, waitForPageLoad, getBody, waitForElementsByClassName } from './util';
import { isLoggedIn } from './auth';
import 'altcha';

/**
 * Get a web token for the captcha system.
 * @returns The web token.
 */
export async function getWebToken(): Promise<string | undefined> {
    await waitForPageLoad();

    let captchaContainer = getElementById('captchaContainer') as HTMLElement;

    if (!captchaContainer) {
        captchaContainer = createElement('div', { id: 'captchaContainer' });

        const container = getElementById('container');
        if (container) {
            addChild(container, captchaContainer);
        } else {
            addChild(await getBody(), captchaContainer);
        }
    }

    /**
     * Get turnstile token.
     * @returns The turnstile token.
     */
    function getTurnstileToken(): Promise<string | undefined> {
        return new Promise(async (resolve) => {
            captchaContainer.innerHTML =
                '<altcha-widget challengeurl="/api/captcha/get" hidelogo hidefooter></altcha-widget>';
            const clicker = ((await waitForElementsByClassName('altcha-checkbox', {})) ?? [])[0];
            document.querySelector('altcha-widget')?.addEventListener('statechange', (ev) => {
                // @ts-expect-error
                if (ev.detail.state === 'verified') {
                    captchaContainer.innerHTML = '';
                    // @ts-expect-error
                    resolve(ev.detail.payload);
                }
            });
            // @ts-expect-error
            clicker?.firstElementChild?.click();
        });
    }

    if (await isLoggedIn()) {
        const token = sessionStorage.getItem('captchaGateway');
        const verified = token
            ? await fetch(`/api/captcha/verify?token=${token}`).catch(() => ({
                  json: () => ({
                      success: false
                  })
              }))
            : {
                  json: () => ({
                      success: false
                  })
              };
        const verifiedData = await verified.json();
        if (verifiedData.success === true) {
            return token ?? '';
        } else {
            const newToken = await getTurnstileToken();
            const newVerified = await fetch(`/api/captcha/gateway?token=${newToken}`).catch(() => undefined);
            if (!newVerified) return await getTurnstileToken();
            const data = await newVerified.json();
            if (data.error) return await getTurnstileToken();
            const verifiedToken = data.token;
            sessionStorage.setItem('captchaGateway', verifiedToken);
            return verifiedToken;
        }
    } else {
        return await getTurnstileToken();
    }
}
