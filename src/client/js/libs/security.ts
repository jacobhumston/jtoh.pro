import { getElementById, createElement, addChild, waitForPageLoad, getBody, wait } from './util';
import { isLoggedIn } from './auth';

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

    if (!turnstile) {
        await wait(1000);
        return await getWebToken();
    }

    /**
     * Get turnstile token.
     * @returns The turnstile token.
     */
    function getTurnstileToken(): Promise<string | undefined> {
        return new Promise((resolve) => {
            captchaContainer.innerHTML = '';
            turnstile.render('#captchaContainer', {
                sitekey: '0x4AAAAAAAyKalxef6nTkf7o',
                callback: function (token) {
                    captchaContainer.innerHTML = '';
                    resolve(token);
                },
                'error-callback': async function (error) {
                    console.error(error);
                    resolve(undefined);
                },
                'unsupported-callback': function () {
                    console.error('Unsupported browser');
                    alert(
                        'Your browser is not supported by our captcha system, please update your browser or try a different one.'
                    );
                    resolve(undefined);
                }
            });
        });
    }

    if (await isLoggedIn()) {
        const token = sessionStorage.getItem('captchaGateway');
        const verified = await fetch(`/api/captcha/verify?token=${token}`).catch(() => ({
            json: () => ({
                success: false
            })
        }));
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
