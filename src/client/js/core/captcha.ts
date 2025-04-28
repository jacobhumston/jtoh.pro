import { getWebToken } from '../libs/security';

export default async function () {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const type = params.get('type');
    if (type === 'auth') {
        try {
            window.history.replaceState({}, document.title, '/app/captcha');
        } catch (error) {
            console.error(error);
        }
        const token = await getWebToken();
        document.location.href = `/api/auth?captcha=${token}&code=${params.get('code')}`;
    } else {
        document.location.href = '/';
    }
}
