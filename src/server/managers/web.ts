/**
 * This script is responsible for compiling
 * and serving assets, such as web pages.
 *
 * Authored by Jacob Humston
 */

import type { Hono } from 'hono';
import { createPath, safelyGetPath } from './files';
import { existsSync, rmSync, readdirSync, symlinkSync } from 'node:fs';
import { parse } from 'node:path';
import { replaceEmptyString } from '../../shared/common-utils';
import { stream } from 'hono/streaming';
import mime from 'mime';
import { build } from 'bun';

/** Path used to store static assets. */
export const staticPath = safelyGetPath('static');

/**
 * Clear the static directory.
 */
export function clearStatic() {
    rmSync(staticPath, { recursive: true, force: true });
    createPath('static'); // we still need the path afterwards
}

/**
 * Serve static files from the static directory.
 * @param app The server application.
 */
export function serveStatic(app: Hono) {
    app.get('/*', async (context) => {
        const reqPath = context.req.path.endsWith('/') ? `${context.req.path}/index.html` : context.req.path;
        const path = parse(reqPath);
        const name = replaceEmptyString(path.name, 'index');
        const dir = path.dir.endsWith('/') ? path.dir : `${path.dir}/`;
        const ext = replaceEmptyString(path.ext, '.html');
        const filePath = `${staticPath}${dir}${name}${ext}`;

        if (!existsSync(filePath)) return context.status(404);
        context.res.headers.set('Content-Type', mime.getType(ext) ?? 'application/octet-stream'); // application/octet-stream seems to be a good backup

        return stream(context, async (stream) => {
            const file = Bun.file(filePath);
            await stream.pipe(file.stream());
        });
    });
}

/**
 * Build web pages. This will either build the html file
 * or create a symlink for other assets.
 */
export async function buildWebPages() {
    clearStatic();

    for (const file of readdirSync('src/client/pages/', { recursive: true, withFileTypes: true })) {
        if (file.isFile()) {
            let path = file.parentPath.replace('src/client/pages/', '');
            if (path === 'src/client/pages') path = '';
            else path = `${path}/`;
            const destinationPath = `static/${path}`;
            createPath(destinationPath);

            // TODO: change some of these options once dev mode is supported
            if (file.name.endsWith('.html')) {
                await build({
                    entrypoints: [`${file.parentPath}/${file.name}`],
                    outdir: destinationPath,
                    splitting: true,
                    sourcemap: 'linked',
                    minify: true,
                    footer: `// Copyright of jtoh.pro, All Rights Reserved.\n//* Compiled ${new Date().toISOString()}`
                });
            } else {
                symlinkSync(safelyGetPath(`${file.parentPath}/${file.name}`), `${destinationPath}${file.name}`);
            }
        }
    }

    for (const file of readdirSync('src/client/assets/', { recursive: true, withFileTypes: true })) {
        let path = file.parentPath.replace('src/client/assets/', '');
        if (path === 'src/client/assets') path = '';
        else path = `${path}/`;
        const destinationPath = `static/assets/${path}`;
        createPath(destinationPath);
        symlinkSync(safelyGetPath(`${file.parentPath}/${file.name}`), `${destinationPath}${file.name}`);
    }
}
