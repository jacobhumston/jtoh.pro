import { getElementById, waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const url = new URL(window.location.href);
    const reason = url.searchParams.get('reason');
    const type = url.searchParams.get('type');
    const expires = url.searchParams.get('expires');

    try {
        window.history.replaceState({}, document.title, '/app/punishment');
    } catch (error) {
        console.error(error);
    }

    if (!reason || !type || !expires) {
        console.error('Missing parameters.');
        return (document.location.href = '/app');
    }

    if (type !== 'LoginBan') {
        console.error('Invalid punishment type. Only LoginBan is supported.');
        return (document.location.href = '/app');
    }

    const reasonElement = getElementById('banReason');
    const expiresElement = getElementById('banExpires');

    if (!reasonElement || !expiresElement) {
        console.error('Required elements not found on the page.');
        return (document.location.href = '/app');
    }

    reasonElement.innerText = decodeURIComponent(reason);

    if (isNaN(Number(expires))) {
        expiresElement.innerText = expires;
    } else {
        const expiresDate = new Date(Number(expires));
        if (isNaN(expiresDate.getTime())) {
            console.error('Invalid expiration date.');
            return;
        }
        expiresElement.innerText = expiresDate.toLocaleString();
    }
}
