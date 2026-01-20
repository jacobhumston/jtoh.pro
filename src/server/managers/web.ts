/**
 * This script is responsible for compiling
 * and serving assets, such as web pages.
 *
 * Authored by Jacob Humston
 */
import type { OpenAPIHono } from '@hono/zod-openapi';
import chokidar from 'chokidar';
import Handlebars from 'handlebars';
import { stream } from 'hono/streaming';
import { minify } from 'html-minifier-next';
import MarkdownIt from 'markdown-it';
import mime from 'mime';
import * as prettier from 'prettier';
import * as sass from 'sass';
import { minify as jsMinify } from 'terser';
import { v4 as uuid } from 'uuid';

import { build } from 'bun';
import { existsSync, rmSync, readdirSync, symlinkSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { parse } from 'node:path';

import { isDev } from '@server/config';
import { getBooleanArg } from '@server/managers/argv';
import { createPath, getFileHash, safelyGetPath } from '@server/managers/files';
import { log } from '@server/modules/logger';
import { replaceEmptyString } from '@shared/common-utils';

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
export function serveStatic(app: OpenAPIHono) {
    app.get('/*', async (context, next) => {
        const reqPath = context.req.path.endsWith('/') ? `${context.req.path}/index.html` : context.req.path;
        const path = parse(reqPath);
        const name = replaceEmptyString(path.name, 'index');
        const dir = path.dir.endsWith('/') ? path.dir : `${path.dir}/`;
        const ext = replaceEmptyString(path.ext, '.html');
        let filePath = `${staticPath}${dir}${name}${ext}`;

        if (!existsSync(filePath)) return await next();
        context.res.headers.set('Content-Type', mime.getType(ext) ?? 'application/octet-stream'); // application/octet-stream seems to be a good backup
        if (!isDev || path.dir.includes('assets')) context.res.headers.set('Cache-Control', 'max-age=604800');
        else context.res.headers.set('Cache-Control', 'no-store');

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
    // flags
    const minifyBuild = await getBooleanArg('minifyBuild');

    clearStatic(); // clean the static folder

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
            if (file.name.endsWith('.html') || file.name.endsWith('.md')) {
                buildEntrypoints.push(`${file.parentPath}/${file.name}`);
            } else {
                symlinkSync(safelyGetPath(`${file.parentPath}/${file.name}`), `${destinationPath}${file.name}`);
            }
        }
    }

    // create symlinks for root files
    for (const file of readdirSync('src/client/root/', { recursive: true, withFileTypes: true })) {
        if (file.isFile()) {
            let path = file.parentPath.replace('src/client/root/', '');
            if (path === 'src/client/root') path = '';
            else path = `${path}/`;
            const destinationPath = `static/${path}`;
            createPath(destinationPath);
            symlinkSync(safelyGetPath(`${file.parentPath}/${file.name}`), `${destinationPath}${file.name}`);
        }
    }

    // bun build
    const markdown = MarkdownIt();
    const markdownTemplate = readFileSync('src/client/templates/markdown.html', 'utf8');
    await build({
        entrypoints: buildEntrypoints,
        outdir: safelyGetPath('static'),
        root: 'src/client/pages',
        splitting: true,
        sourcemap: isDev && !minifyBuild ? 'inline' : 'none',
        minify: !isDev || minifyBuild,
        footer: `\n\n// @copyright Copyright of jtoh.pro, All Rights Reserved. (c)${new Date().getFullYear()}`,
        target: 'browser',
        naming: {
            asset: '[dir]/[name].[hash].[ext]',
            chunk: '[dir]/[name].[hash].[ext]',
            entry: '[dir]/[name].[ext]'
        },
        external: [
            '*.png',
            '*.jpg',
            '*.jpeg',
            '*.gif',
            '*.svg',
            '*.webp',
            '*.mp4',
            '*.mp3',
            '*.webmanifest',
            '*.ttf',
            '*.woff2'
        ],
        plugins: [
            {
                // markdown files
                name: 'Markdown Compiler',
                setup: function (build: Bun.PluginBuilder): void | Promise<void> {
                    build.onLoad({ filter: /\.md$/i }, (args) => {
                        const fileContent = readFileSync(args.path, 'utf8');
                        return {
                            contents: Handlebars.compile(
                                markdownTemplate.replace('CONTENT', markdown.render(fileContent))
                            )(templates),
                            loader: 'html'
                        };
                    });
                }
            },
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
        if (!file.isFile()) continue;
        let path = file.parentPath.replace('src/client/assets/', '');
        if (path === 'src/client/assets') path = '';
        else path = `${path}/`;
        const destinationPath = `static/assets/${path}`;
        createPath(destinationPath);
        symlinkSync(safelyGetPath(`${file.parentPath}/${file.name}`), `${destinationPath}${file.name}`);
    }

    // build workers
    const workerEntrypoints: string[] = [];
    for (const file of readdirSync('src/client/js/workers/', { recursive: true, withFileTypes: true })) {
        if (file.isFile() && file.name.endsWith('.ts')) {
            workerEntrypoints.push(`${file.parentPath}/${file.name}`);
        }
    }
    if (workerEntrypoints.length > 0) {
        await build({
            entrypoints: workerEntrypoints,
            outdir: safelyGetPath('static/js/workers'),
            splitting: false,
            sourcemap: isDev && !minifyBuild ? 'inline' : 'none',
            minify: !isDev || minifyBuild,
            footer: `\n\n// @copyright Copyright of jtoh.pro, All Rights Reserved. (c)${new Date().getFullYear()}`,
            target: 'browser',
            naming: {
                entry: '[name].[ext]'
            }
        });
    }

    // remove duplicate files and replace their references with the orginal
    // also renames files if in production mode
    // note that this segment runs under the assumption that all non-symbolic link files are text based
    // and that it's iterating top to bottom
    {
        // create name map
        const nameMap: Map<string, string> = new Map();
        for (const file of readdirSync('static', { recursive: true, withFileTypes: true })) {
            if (!file.isFile() || file.isSymbolicLink() || file.name.endsWith('.html')) continue;
            if (isDev && !minifyBuild) nameMap.set(file.name, file.name);
            else
                nameMap.set(
                    file.name,
                    `${uuid().split('-')[0]}.${file.name.split('.').findLast((v) => typeof v === 'string')}`
                );
        }

        // replace duplicate files
        const refrenceMap: Map<string, { new: string; newPath: string }> = new Map();
        const hashMap: Map<string, string> = new Map();
        for (const file of readdirSync('static', { recursive: true, withFileTypes: true })) {
            const filePath = `${file.parentPath}/${file.name}`;
            if (!file.isFile() || file.isSymbolicLink() || file.name.endsWith('.html')) continue;
            if (!existsSync(filePath)) continue;

            const fileHash = hashMap.get(filePath) ?? (await getFileHash(filePath));
            hashMap.set(filePath, fileHash);

            // run through other files
            for (const file2 of readdirSync('static', { recursive: true, withFileTypes: true })) {
                const file2Path = `${file2.parentPath}/${file2.name}`;
                if (!file2.isFile() || file2.isSymbolicLink() || file2.name.endsWith('.html') || filePath === file2Path)
                    continue;

                const file2Hash = hashMap.get(file2Path) ?? (await getFileHash(file2Path));
                hashMap.set(file2Path, file2Hash);

                if (fileHash !== file2Hash) continue;
                rmSync(file2Path, { force: true });

                // Store the new name and the path to the original file
                refrenceMap.set(file2.name, {
                    new: nameMap.get(file.name) ?? file.name,
                    newPath: file.parentPath
                });
            }

            // rename file
            renameSync(filePath, filePath.replace(file.name, nameMap.get(file.name) ?? file.name));
        }

        // update references and file names
        // this will load the entire file into memory at once :(
        for (const file of readdirSync('static', { recursive: true, withFileTypes: true })) {
            if (!file.isFile() || file.isSymbolicLink()) continue;
            const filePath = `${file.parentPath}/${file.name}`;

            let content = readFileSync(filePath, 'utf-8');
            for (const [name, data] of refrenceMap) {
                const currentDir = file.parentPath
                    .replace('static', '')
                    .split('/')
                    .filter((s) => s);
                const targetDir = data.newPath
                    .replace('static', '')
                    .split('/')
                    .filter((s) => s);

                let commonLength = 0;
                for (let i = 0; i < Math.min(currentDir.length, targetDir.length); i++) {
                    if (currentDir[i] === targetDir[i]) commonLength++;
                    else break;
                }

                const upLevels = currentDir.length - commonLength;
                const downPath = targetDir.slice(commonLength);

                let relativePath = '';
                if (upLevels === 0 && downPath.length === 0) {
                    relativePath = `./${data.new}`;
                } else {
                    relativePath = `${'../'.repeat(upLevels)}${downPath.length > 0 ? downPath.join('/') + '/' : ''}${data.new}`;
                }

                content = content.replace(`./${name}`, relativePath);
            }
            for (const [old, value] of nameMap) {
                content = content.replace(old, value);
            }
            writeFileSync(filePath, content, 'utf8');
        }
    }

    // minify (in prod)
    if (!isDev || minifyBuild === true) {
        log('info', 'Minifying build enabled, this may take a moment...');
        for (const file of readdirSync('static/', { recursive: true, withFileTypes: true })) {
            if (file.isFile()) {
                // minify html
                if (file.name.endsWith('.html')) {
                    if (isDev) log('debug', `Minifying (html) ${file.parentPath}/${file.name}`);
                    const path = `${file.parentPath}/${file.name}`;
                    const content = readFileSync(path, 'utf8');
                    const minified = await minify(content, {
                        minifyCSS: true,
                        minifyJS: { compress: { passes: 3, drop_console: true }, mangle: true },
                        removeComments: true,
                        removeAttributeQuotes: true,
                        collapseWhitespace: true
                    }).catch(() => null);
                    if (!minified) continue;
                    writeFileSync(path, minified);
                    // minify js
                } else if (file.name.endsWith('.js')) {
                    if (isDev) log('debug', `Minifying (js) ${file.parentPath}/${file.name}`);
                    const path = `${file.parentPath}/${file.name}`;
                    const content = readFileSync(path, 'utf8');
                    const minified = await jsMinify(content, {
                        compress: { passes: 3, drop_console: true },
                        mangle: true,
                        format: {
                            comments: /jtoh\.pro/
                        }
                    }).catch(() => null);
                    if (!minified) continue;
                    writeFileSync(path, minified.code ?? '');
                }
                // not going to minify css due to it already being minified pretty well by bun
            }
        }
    }

    // optionally format code at the end
    // requires '--prettyBuild true' to be passed
    // not recommended outside of testing
    if ((await getBooleanArg('prettyBuild')) === true) {
        log('info', 'Pretty build enabled, this may take a moment...');
        const config = JSON.parse(readFileSync('.prettierrc.json', 'utf8'));
        for (const file of readdirSync('static', { recursive: true, withFileTypes: true })) {
            if (!file.isFile() || file.isSymbolicLink()) continue;
            const filePath = `${file.parentPath}/${file.name}`;
            if (!file.name.endsWith('.js') && !file.name.endsWith('.css') && !file.name.endsWith('.html')) continue;
            let content: string | null = readFileSync(filePath, 'utf-8');
            content = await prettier.format(content, Object.assign(config, { filepath: filePath })).catch(() => null);
            if (content === null) {
                log('error', `Failed to format ${filePath}`);
                continue;
            }
            writeFileSync(filePath, content, 'utf8');
        }
    }
}

/**
 * Development function that rebuilds the frontend on file changes in `src/client/`.
 */
export function hotReloadFrontend() {
    let rebuild = false;
    setInterval(async () => {
        if (rebuild === true) {
            rebuild = false;
            log('info', 'Hot reload rebuilding...');
            await buildFrontend().catch(() => {
                rebuild = true;
            });
            log('success', 'Hot reload rebuild completed.');
        }
    }, 1000);

    chokidar.watch('src/client/').on('all', () => {
        rebuild = true;
    });
}

/**
 * Get a list of web pages from the static folder.
 * Note that these paths are the web based location, however
 * you can get the file path by adding static to the front of
 * the path.
 * @param skipAdmin If true, admin pages will be skipped.
 * @returns The list of web pages.
 */
export function getStaticPagesWebPaths(skipAdmin: boolean): string[] {
    const pages: string[] = [];
    for (const file of readdirSync('static/', { withFileTypes: true, recursive: true })) {
        if (file.isFile() && file.name.endsWith('.html')) {
            if (skipAdmin && file.parentPath.includes('admin')) continue;
            pages.push(`${file.parentPath.replace('static', '')}/${file.name.split('.')[0]}`);
        }
    }
    return pages;
}
