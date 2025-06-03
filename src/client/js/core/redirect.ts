import { getElementById, waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const redirectButton = getElementById('redirectButton') as HTMLButtonElement;

    function redirect() {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        let newUrl: any = null;

        if (searchParams.has('url')) {
            newUrl = searchParams.get('url');
        } else if (searchParams.has('redirect')) {
            newUrl = searchParams.get('redirect');
        } else if (searchParams.has('target')) {
            newUrl = searchParams.get('target');
        }

        try {
            newUrl = new URL(newUrl);
        } catch {
            newUrl = null;
        }

        if (!newUrl) {
            document.location.href = '/';
        } else {
            if (newUrl.host === url.host && newUrl.protocol === url.protocol) {
                document.location.href = newUrl.href;
            } else {
                document.location.href = '/';
            }
        }
    }

    redirectButton.addEventListener('click', redirect);
    redirect();
}
