/**
 * This script is ran on the 404 page.
 * Basically just fetches a list of possible other urls
 * and displays them.
 *
 * Authored by Jacob Humston
 */
import sanitizeHtml from 'sanitize-html';

import { client } from '@client/modules/api';
import { getIconHTML } from '@client/utils/elements';

const url = new URL(document.location.href);
const from = url.searchParams.get('from');

const possibleOtherPages = document.getElementById('possibleOtherPages');

if (from && possibleOtherPages) {
    const possiblePaths = await client.GET('/api/resolve-path', { params: { query: { path: from } } });
    if (possiblePaths.data && possiblePaths.data.length > 0) {
        possibleOtherPages.innerHTML = `Are you looking for any of these?<div>${possiblePaths.data
            .map((p) => sanitizeHtml(p))
            .map((path) => {
                const a = document.createElement('a');
                a.href = sanitizeHtml(path);
                a.innerHTML = `${getIconHTML('open_in_new')} ${sanitizeHtml(path)}`;
                return a.outerHTML;
            })
            .join('')}<div>`;
    }
}
