import { getBody, waitForElementByIdExpected, waitForPageLoad } from '../libs/util';

/**
 * Get the progress bar ready to use. This is just cosmetic, so it doesn't really matter if it ends up
 */
export async function initProgressBar() {
    const pageProgressBarChild = await waitForElementByIdExpected('pageProgressBarChild', 'div', {});
    if (!pageProgressBarChild) return;

    const body = await getBody();

    await waitForPageLoad();

    let alreadyLoading = false;

    document.addEventListener('click', async (event) => {
        let target = event.target as HTMLElement | null;
        if (!target) return;

        target = target.closest('a');

        if (
            target instanceof HTMLAnchorElement &&
            !target.hasAttribute('download') &&
            target.href &&
            target.target !== '_blank'
        ) {
            event.preventDefault();

            if (alreadyLoading) return;
            alreadyLoading = true;

            body.style.cursor = 'wait';

            const url = target.href;
            pageProgressBarChild.style.width = '50%';

            await fetch(url, { method: 'GET', credentials: 'include', cache: 'default' }).catch(console.error);

            document.location = url;

            pageProgressBarChild.style.transitionDuration = '500ms';
            pageProgressBarChild.style.width = '100%';
            pageProgressBarChild.style.backgroundColor = 'transparent';
        }
    });
}
