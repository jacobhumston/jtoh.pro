import { getHead } from '../libs/util';

/**
 * Update title element in the head of the document.
 */
export async function updatePageTitle() {
    const origin = new URL(window.location.href).host;
    const head = await getHead();

    document.title = `${origin} - ${head.dataset.page ?? 'Untitled Page'}`;
}
