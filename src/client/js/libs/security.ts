import { getElementById, createElement, addChild, waitForPageLoad, waitForElementsByClassName } from './util';
import { isLoggedIn } from './auth';

/**
 * Get a web token for the captcha system.
 * @returns The web token.
 */
export async function getWebToken(): Promise<string | undefined> {
    await waitForPageLoad();

    let captchaContainer = getElementById('captchaContainer') as HTMLElement;
    if (captchaContainer) {
        console.warn(
            'Legacy captcha container found, they should no longer be created or used, as they will be skipped.'
        );
        captchaContainer.remove();
    }

    captchaContainer = createElement('div', { id: 'captchaContainer' });
    addChild(
        captchaContainer,
        createElement('p', {
            innerHTML:
                'An action you are trying to perform requires a captcha. <br>Please wait a moment as we verify that you are not a robot.'
        })
    );
    captchaContainer.style.display = 'none';
    addChild(document.documentElement, captchaContainer);

    /**
     * Get an altcha token.
     * @returns The altcha token.
     */
    function getAltchaToken(): Promise<string | undefined> {
        return new Promise(async (resolve) => {
            captchaContainer.innerHTML = `${captchaContainer.innerHTML}<altcha-widget challengeurl="/api/captcha/get" hidelogo hidefooter></altcha-widget>`;
            addChild(
                captchaContainer,
                createElement('i', {
                    innerHTML: 'Having trouble? <a target="_blank" href="https://discord.jtoh.pro">Let us know.</a>'
                })
            );
            captchaContainer.style.display = '';

            await import('altcha');

            const clicker = ((await waitForElementsByClassName('altcha-checkbox', {})) ?? [])[0];
            document.querySelector('altcha-widget')?.addEventListener('statechange', (ev) => {
                // @ts-expect-error
                if (ev.detail.state === 'verified') {
                    captchaContainer.innerHTML = '';
                    captchaContainer.style.display = 'none';
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
            const newToken = await getAltchaToken();
            const newVerified = await fetch(`/api/captcha/gateway?token=${newToken}`).catch(() => undefined);
            if (!newVerified) return await getAltchaToken();
            const data = await newVerified.json();
            if (data.error) return await getAltchaToken();
            const verifiedToken = data.token;
            sessionStorage.setItem('captchaGateway', verifiedToken);
            return verifiedToken;
        }
    } else {
        return await getAltchaToken();
    }
}

/** Log warning to console. */
export function logConsolePasteWarning(): void {
    console.log('%c' + 'Warning!', 'color:rgb(168, 34, 34); font-size: 72px; font-weight: bold;');
    console.log(
        '%c' + 'Do not paste anything here! You may get your account stolen or your device compromised!',
        'color:rgba(255, 255, 255, 0.75); font-size: 20px; font-weight: bold;'
    );
}
