/**
 * This script is ran on the 404 page.
 * Basically just fetches a list of possible other urls
 * and displays them.
 *
 * Authored by Jacob Humston
 */
import { HTML } from 'imperative-html';
import sanitizeHtml from 'sanitize-html';

import { client } from '@client/modules/api';

const url = new URL(document.location.href);
const from = url.searchParams.get('from');

const possibleOtherPages = document.getElementById('possibleOtherPages');

if (from && possibleOtherPages) {
    const possiblePaths = await client.GET('/api/resolve-path', { params: { query: { path: from } } });
    if (possiblePaths.data && possiblePaths.data.length > 0) {
        possibleOtherPages.innerHTML = `Are you looking for any of these?<br>${possiblePaths.data
            .map((p) => sanitizeHtml(p))
            .map((path) => HTML.a({ href: path }, path).outerHTML)
            .join('<br>')}`;
    }
}
