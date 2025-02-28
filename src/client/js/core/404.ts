import { getElementById, waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const goBack = getElementById('goBack') as HTMLButtonElement;
    const goHome = getElementById('goHome') as HTMLButtonElement;

    goBack.addEventListener('click', () => {
        window.history.back();
    });

    goHome.addEventListener('click', () => {
        window.location.href = '/';
    });
}
