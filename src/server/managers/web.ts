/**
 * This script is responsible for compiling
 * and serving assets, such as web pages.
 *
 * Authored by Jacob Humston
 */
import { build } from 'bun';
import Handlebars from 'handlebars';
import type { Hono } from 'hono';
import { stream } from 'hono/streaming';
import mime from 'mime';
import * as sass from 'sass';

import { existsSync, rmSync, readdirSync, symlinkSync, readFileSync } from 'node:fs';
import { parse } from 'node:path';

import { replaceEmptyString } from '../../shared/common-utils';
import { isDev } from '../config';
import { createPath, safelyGetPath } from './files';

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

    // load templates
    const templates: { [key: string]: string } = {};
    for (const file of readdirSync('src/client/templates', { recursive: true, withFileTypes: true })) {
        if (file.isFile()) {
            const content = readFileSync(`${file.parentPath}/${file.name}`, 'utf8');
            templates[file.name.split('.')[0]] = content;
        }
    }

    // entrypoints
    const buildEntrypoints: string[] = [];

    // add entry points
    // this will also handle symlinks in case we need to add files to the same directory as a page
    for (const file of readdirSync('src/client/pages/', { recursive: true, withFileTypes: true })) {
        if (file.isFile()) {
            let path = file.parentPath.replace('src/client/pages/', '');
            if (path === 'src/client/pages') path = '';
            else path = `${path}/`;
            const destinationPath = `static/${path}`;
            createPath(destinationPath);

            // build (or symlink)
            if (file.name.endsWith('.html')) {
                buildEntrypoints.push(`${file.parentPath}/${file.name}`);
            } else {
                symlinkSync(safelyGetPath(`${file.parentPath}/${file.name}`), `${destinationPath}${file.name}`);
            }
        }
    }

    // bun build
    await build({
        entrypoints: buildEntrypoints,
        outdir: safelyGetPath('static'),
        splitting: true,
        sourcemap: isDev ? 'linked' : 'none',
        minify: !isDev,
        footer: `\n\n// Copyright of jtoh.pro, All Rights Reserved.\n// * Compiled ${new Date().toISOString()}`,
        target: 'browser',
        naming: {
            asset: '[dir]/[name].[hash].[ext]',
            chunk: '[dir]/[name].[hash].[ext]',
            entry: '[dir]/[name].[ext]'
        },
        plugins: [
            {
                // handlebars plugin
                name: 'Template Compiler',
                setup: function (build: Bun.PluginBuilder): void | Promise<void> {
                    build.onLoad({ filter: /\.html$/i }, (args) => {
                        const fileContent = readFileSync(args.path, 'utf8');
                        const template = Handlebars.compile(fileContent);
                        return { contents: template(templates) };
                    });
                }
            },
            {
                // sass plugin
                name: 'Sass Compiler',
                setup: function (build: Bun.PluginBuilder): void | Promise<void> {
                    build.onLoad({ filter: /\.scss$/i }, (args) => {
                        const compiled = sass.compile(args.path);
                        return { contents: compiled.css, loader: 'css' };
                    });
                }
            }
        ]
    });

    // create asset symlinks
    for (const file of readdirSync('src/client/assets/', { recursive: true, withFileTypes: true })) {
        let path = file.parentPath.replace('src/client/assets/', '');
        if (path === 'src/client/assets') path = '';
        else path = `${path}/`;
        const destinationPath = `static/assets/${path}`;
        createPath(destinationPath);
        symlinkSync(safelyGetPath(`${file.parentPath}/${file.name}`), `${destinationPath}${file.name}`);
    }
}
