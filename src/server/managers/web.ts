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
import { minify } from 'html-minifier-next';
import mime from 'mime';
import * as sass from 'sass';
import { minify as jsMinify } from 'terser';

import { existsSync, rmSync, readdirSync, symlinkSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'node:path';

import { replaceEmptyString } from '../../shared/common-utils';
import { isDev } from '../config';
import { log } from '../modules/logger';
import { getCLIArgument } from './argv';
import { createPath, getFileHash, safelyGetPath } from './files';

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
 * This function compiles the entire frontend! So it
 * may be a bit slow, especially when minifying everything.
 */
export async function buildFrontend() {
    clearStatic(); // clean the static folder

    // load templates
    const templates: { [key: string]: string } = {};
    for (const file of readdirSync('src/client/templates', { recursive: true, withFileTypes: true })) {
        if (file.isFile()) {
            const content = readFileSync(`${file.parentPath}/${file.name}`, 'utf8');
            templates[file.name.split('.')[0]] = content;
        }
    }
    log('debug', '(build) Loaded templates.');

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
    log('debug', '(build) Gathered entry points and symlinks.');

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
    log('debug', '(build) Built files w/ plugins.');

    // create asset symlinks
    for (const file of readdirSync('src/client/assets/', { recursive: true, withFileTypes: true })) {
        let path = file.parentPath.replace('src/client/assets/', '');
        if (path === 'src/client/assets') path = '';
        else path = `${path}/`;
        const destinationPath = `static/assets/${path}`;
        createPath(destinationPath);
        symlinkSync(safelyGetPath(`${file.parentPath}/${file.name}`), `${destinationPath}${file.name}`);
    }
    log('debug', '(build) Asset symlinks created.');

    // minify (in prod)
    if (!isDev) {
        for (const file of readdirSync('static/', { recursive: true, withFileTypes: true })) {
            if (file.isFile()) {
                // minify html
                if (file.name.endsWith('.html')) {
                    const path = `${file.parentPath}/${file.name}`;
                    const content = readFileSync(path, 'utf8');
                    const minified = await minify(content, {
                        minifyCSS: { level: 2 },
                        minifyJS: { compress: { passes: 3 }, mangle: true },
                        removeComments: true,
                        removeAttributeQuotes: true,
                        collapseWhitespace: true
                    });
                    writeFileSync(path, minified);
                    // minify js
                } else if (file.name.endsWith('.js')) {
                    const path = `${file.parentPath}/${file.name}`;
                    const content = readFileSync(path, 'utf8');
                    const minified = await jsMinify(content, {
                        compress: { passes: 3 },
                        mangle: true,
                        format: { comments: true }
                    });
                    writeFileSync(path, minified.code ?? '');
                }
                // not going to minify css due to it already being minified pretty well by bun
            }
        }
        log('debug', '(build) Files minified.');
    }

    // putting this behind an arg cause it "could" be slow
    // default will be true for now!
    if (((await getCLIArgument('linkBuild', 'boolean', true)) ?? true) === true) {
        const hashTable: { [key: string]: string } = {}; // TODO: possibly use a cache in the future, but this works fine for now

        /**
         * Link duplicate files together.
         */
        async function link() {
            let linked = false;
            for (const file of readdirSync('static/', { recursive: true, withFileTypes: true })) {
                if (linked === true) break;
                if (file.isSymbolicLink() || !file.isFile()) continue;
                for (const file2 of readdirSync('static/', { recursive: true, withFileTypes: true })) {
                    if (file2.isSymbolicLink() || !file2.isFile()) continue;
                    const path = safelyGetPath(`${file.parentPath}/${file.name}`);
                    const path2 = safelyGetPath(`${file2.parentPath}/${file2.name}`);
                    if (path === path2) continue;
                    const hash = hashTable[path] ?? (await getFileHash(path));
                    const hash2 = hashTable[path2] ?? (await getFileHash(path2));
                    hashTable[path] = hash;
                    hashTable[path2] = hash2;
                    if (hash === hash2) {
                        rmSync(path2, { force: true });
                        symlinkSync(path, path2);
                        linked = true;
                        break;
                    }
                }
            }
            if (linked === true) return await link();
        }

        // to be more efficient, replace duplicate files with symlinks
        await link();
        log('debug', '(build) Duplicate build files converted to symlinks.');
    }
}
