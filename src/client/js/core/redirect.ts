import { document, window } from '../libs/global';
import { isLoggedIn } from '../libs/auth';
import { getElementById, waitForPageLoad } from '../libs/util';

export default async function () {
    await waitForPageLoad();

    const redirectButton = getElementById('redirectButton') as HTMLButtonElement;

    async function redirect() {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        let newUrl: any = '';

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
            if (
                (newUrl.host === url.host || newUrl.host.endswith('.' + url.host)) &&
                newUrl.protocol === url.protocol
            ) {
                if (newUrl.href.includes('mod') || newUrl.href.includes('admin')) {
                    if (!(await isLoggedIn())) {
                        window.sessionStorage.setItem('LoginRedirect', window.location.href);
                        window.location.href = '/login';
                    } else {
                        document.location.href = newUrl.href;
                    }
                } else {
                    document.location.href = newUrl.href;
                }
            } else {
                document.location.href = '/';
            }
        }
    }

    redirectButton.addEventListener('click', redirect);
    redirect();
}
