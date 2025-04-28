import { getElementByIdExpected, waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const button = getElementByIdExpected('robloxSignup', 'button');
    if (!button) return;

    button.addEventListener('click', () => {
        document.location.href = '/login';
    });
}
