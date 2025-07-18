import { document, window } from '../libs/global';
import { getHead } from '../libs/util';

/**
 * Update title element in the head of the document.
 */
export async function updatePageTitle() {
    const origin = new URL(window.location.href).host;
    const head = await getHead();

    if (document.documentElement.dataset.custom === 'true') {
        document.title = head.dataset.page ?? 'Untitled Page';
        return;
    }

    document.title = `${origin} - ${head.dataset.page ?? 'Untitled Page'}`;
}
