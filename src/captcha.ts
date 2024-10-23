import { isDev } from './dev';
import { cloudflareCaptchaSecret } from './tokens';

export async function verifyCaptcha(token: string) {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            secret: cloudflareCaptchaSecret,
            response: token
        })
    }).catch(() => {
        return null;
    });
    if (!response) return false;
    const data = await response.json();
    return data.success && data.hostname === (isDev ? 'localhost' : 'jtoh.pro');
}
