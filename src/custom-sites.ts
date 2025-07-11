import type { Hono } from 'hono';
import { JSDOM } from 'jsdom';
import { parseRobloxAccountV2WithCache } from './login-auth';
import { customSitesDB } from './db';

export default async function listenForCustomSites(app: Hono) {
    app.get('/api/custom-sites/*', async (context) => {
        const paths = context.req.path.split('/').filter((p) => p !== '' && p !== 'api' && p !== 'custom-sites');
        const name = paths[0];
        const path = paths.slice(1).join('/') || '/';
        const user = await parseRobloxAccountV2WithCache(name, context);
        if (!user) return context.json({ error: 'Unknown site.' }, 401) as any;

        const siteData = (await customSitesDB.get(`_${user.id}`)) ?? {};

        const base = await app.request('/app/custom-site');
        const baseHTML = await base.text();
        const dom = new JSDOM(baseHTML);
        const document = dom.window.document;

        if (siteData.claimed !== true) {
            const element = document.createElement('p');
            element.id = 'unclaimedCustomSiteNotice';
            element.innerHTML = `This custom site has not been claimed yet by ${user.name}!`;
            document.body.appendChild(element);
            return context.html(dom.serialize());
        }

        return context.html(dom.serialize());
    });
}
