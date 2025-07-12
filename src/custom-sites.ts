import type { Hono } from 'hono';
import { JSDOM } from 'jsdom';
import { parseRobloxAccountV2WithCache } from './login-auth';
import { customSitesDB } from './db';
import { getURL, getURLHost } from './dev';

export default async function listenForCustomSites(app: Hono) {
    app.get('/api/custom-sites/*', async (context) => {
        const paths = context.req.path.split('/').filter((p) => p !== '' && p !== 'api' && p !== 'custom-sites');
        const name = paths[0];
        const path = paths.slice(1).join('/') || '/';

        if (context.req.url.includes('/api/custom-sites/')) return context.redirect(getURL());

        const user = await parseRobloxAccountV2WithCache(name, context);
        if (!user) return context.redirect(getURL());

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

            const element1 = document.createElement('a');
            element1.id = 'claimUnclaimedCustomSiteLink';
            element1.href = `${getURL()}/app/account/custom-site-settings`;
            element1.innerHTML = '<br>Is this you? Claim today!';
            element.appendChild(element1);

            const element2 = document.createElement('a');
            element2.href = getURL();
            element2.innerHTML = `Head back to ${getURLHost()}.`;
            element2.id = 'unclaimedCustomSiteHeadBackLink';
            document.body.appendChild(element2);
            return context.html(dom.serialize());
        }

        return context.html(dom.serialize());
    });
}
