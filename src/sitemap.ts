import type { Hono } from 'hono';
import sitemap from 'sitemap';
import stream from 'node:stream';
import fs from 'node:fs';
import { getURL } from './dev';

function getLinks() {
    const links: Array<{ url: string; changefreq: string; priority: number }> = [];
    function readDir(dir: string, appendPath: string) {
        const files = fs.readdirSync(`${appendPath}/${dir}`);
        for (const file of files) {
            const path = `${appendPath}/${dir}/${file}`;
            if (fs.statSync(path).isDirectory()) {
                readDir(`${dir}/${file}`, appendPath);
            } else {
                let fileName = file;
                if (fileName.endsWith('.html')) fileName = fileName.slice(0, -5);
                links.push({ url: `${dir}/${fileName}`, changefreq: 'daily', priority: 0.8 });
            }
        }
    }
    readDir('', 'src/web');

    links.push({ url: '/sitemap.xml', changefreq: 'daily', priority: 0.8 });
    links.push({ url: '/sitemap.json', changefreq: 'daily', priority: 0.8 });

    return links.filter((obj) => !obj.url.startsWith('/app/admin') && !obj.url.includes('/app/templates'));
}

export async function serveSitemap(app: Hono) {
    app.get('/sitemap.xml', async (context) => {
        const sitemapStream = new sitemap.SitemapStream({ hostname: getURL() });
        const data = await sitemap
            .streamToPromise(stream.Readable.from(getLinks()).pipe(sitemapStream))
            .then((data) => data.toString());

        context.header('Content-Type', 'application/xml');
        return context.body(data);
    });

    app.get('/sitemap.json', async (context) => {
        return context.json({
            urlset: getLinks().map((obj) => ({ loc: getURL() + obj.url, ...obj, url: undefined }))
        });
    });
}
