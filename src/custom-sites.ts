import type { Hono } from 'hono';
import { JSDOM } from 'jsdom';
import { parseRobloxAccountV2WithCache } from './login-auth';
import { customSitesDB } from './db';
import { getURL, getURLHost } from './dev';
import { getTempToken } from './temp-tokens';

export default async function listenForCustomSites(app: Hono) {
    app.get('/api/custom-sites/*', async (context) => {
        const paths = context.req.path.split('/').filter((p) => p !== '' && p !== 'api' && p !== 'custom-sites');
        const name = paths[0];
        const path = paths.slice(1).join('/') || '/';

        if (context.req.url.includes('/api/custom-sites/')) return context.redirect(getURL());

        const user = await parseRobloxAccountV2WithCache(name, context);
        if (!user) return context.redirect(getURL());

        const siteData = (await customSitesDB.get(`_${user.id}`)) ?? {};

        const base = await fetch(`${getURL()}/app/custom-site?rlb-token=${getTempToken('rlb-token')}`).catch(
            () => null
        );
        if (base === null || !base.ok) return context.text('Failed to load custom site.', 500);
        const baseHTML = await base.text();

        const dom = new JSDOM(baseHTML);
        const document = dom.window.document;
        const body = document.body;
        const head = document.head;
        const root = document.documentElement;

        head.dataset.page = `${user.displayName}'s Custom Site`;

        function addMeta(type: 'name' | 'property', name: string, content: string) {
            const meta = document.createElement('meta');
            meta.setAttribute(type, name);
            meta.setAttribute('content', content);
            head.appendChild(meta);
        }

        if (user.thumbnail) {
            const favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.type = 'image/png';
            favicon.href = user.thumbnail;
            head.appendChild(favicon);
        }

        if (siteData.claimed !== true) {
            const element = document.createElement('p');
            element.id = 'unclaimedCustomSiteNotice';
            element.innerHTML = `This custom site has not been claimed yet by ${user.name}!`;
            body.appendChild(element);

            const element1 = document.createElement('a');
            element1.id = 'claimUnclaimedCustomSiteLink';
            element1.href = `${getURL()}/app/account/custom-site-settings`;
            element1.innerHTML = '<br>Is this you? Claim today!';
            element.appendChild(element1);

            const element2 = document.createElement('a');
            element2.href = getURL();
            element2.innerHTML = `Head back to ${getURLHost()}.`;
            element2.id = 'unclaimedCustomSiteHeadBackLink';
            body.appendChild(element2);

            addMeta('name', 'description', `@${user.name} has not claimed their custom site yet!`);
            addMeta('property', 'og:description', `@${user.name} has not claimed their custom site yet!`);
            addMeta('property', 'og:title', `${user.displayName}'s Custom Site`);

            return context.html(dom.serialize());
        }

        const iframe = document.createElement('iframe');
        const iframeDocument = iframe.contentDocument as Document;
        body.appendChild(iframe);

        console.log(iframeDocument);

        return context.html(dom.serialize());
    });
}
