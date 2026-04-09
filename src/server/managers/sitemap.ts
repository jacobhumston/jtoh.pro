/**
 * This manager manages the sitemap for the website.
 * It's important that this is accurate so all pages
 * can be indexed properly.
 *
 * Authored by Jacob Humston
 */
import { EnumChangefreq, simpleSitemapAndIndex, type SitemapItemLoose } from 'sitemap';

import { readdirSync } from 'node:fs';

import { serverURL } from '@server/config';

/**
 * Generate a sitemap.
 * It is VERY important that the build files are already
 * ready by the time this function is called, as that
 * is how the sitemap generates the needed links.
 */
export async function generateSiteMap() {
    const items: SitemapItemLoose[] = [];
    for (const file of readdirSync('static/', { withFileTypes: true, recursive: true })) {
        if (file.isFile()) {
            if (file.name.endsWith('.html')) {
                if (file.parentPath.includes('admin')) continue;
                let fileName = file.name.split('.')[0];
                if (fileName === 'index') fileName = '';
                items.push({
                    url: file.parentPath.replace('static', '') + '/' + fileName,
                    changefreq: EnumChangefreq.DAILY
                });
            }
        }
    }

    await simpleSitemapAndIndex({
        hostname: serverURL.href,
        destinationDir: 'static/',
        sourceData: items,
        gzip: false
    });
}
