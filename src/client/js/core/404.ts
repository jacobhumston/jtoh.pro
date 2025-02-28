import { getElementById, waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const goBack = getElementById('goBack') as HTMLButtonElement;
    const goHome = getElementById('goHome') as HTMLButtonElement;

    goBack.onclick = () => {
        window.history.back();
    };

    goHome.onclick = () => {
        window.location.href = '/';
    };
}
