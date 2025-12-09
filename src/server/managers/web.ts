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
import mime from 'mime';
import * as prettier from 'prettier';
import * as sass from 'sass';
import { minify as jsMinify } from 'terser';
import { v4 as uuid } from 'uuid';

import { build } from 'bun';
import { existsSync, rmSync, readdirSync, symlinkSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { parse } from 'node:path';

import { replaceEmptyString } from '../../shared/common-utils';
import { isDev } from '../config';
import { log } from '../modules/logger';
import { getBooleanArg } from './argv';
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
        if (!isDev) context.res.headers.set('Cache-Control', 'max-age=604800');
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
    clearStatic(); // clean the static folder

    // load templates
    const templates: { [key: string]: string } = {};
    for (const file of readdirSync('src/client/templates', { recursive: true, withFileTypes: true })) {
        if (file.isFile()) {
            const content = readFileSync(`${file.parentPath}/${file.name}`, 'utf8');
            templates[file.name.split('.')[0]] = content;
        }
    }
    //log('debug', '(build) Loaded templates.');

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
    //log('debug', '(build) Gathered entry points and symlinks.');

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
    //log('debug', '(build) Symlinks created for root files.');

    // bun build
    await build({
        entrypoints: buildEntrypoints,
        outdir: safelyGetPath('static'),
        splitting: true,
        sourcemap: isDev ? 'linked' : 'none',
        minify: !isDev,
        footer: `\n\n// @copyright Copyright of jtoh.pro, All Rights Reserved. (c)${new Date().getFullYear()}`,
        target: 'browser',
        naming: {
            asset: '[dir]/[name].[hash].[ext]',
            chunk: '[dir]/[name].[hash].[ext]',
            entry: '[dir]/[name].[ext]'
        },
        external: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg', '*.webp', '*.mp4', '*.mp3', '*.webmanifest', '*.ttf'],
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
    //log('debug', '(build) Built files w/ plugins.');

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
    //log('debug', '(build) Asset symlinks created.');

    // remove duplicate files and replace their references with the orginal
    // also renames files if in production mode
    // note that this segment runs under the assumption that all non-symbolic link files are text based
    // and that it's iterating top to bottom
    {
        // create name map
        const nameMap: Map<string, string> = new Map();
        for (const file of readdirSync('static', { recursive: true, withFileTypes: true })) {
            if (!file.isFile() || file.isSymbolicLink() || file.name.endsWith('.html')) continue;
            if (isDev) nameMap.set(file.name, file.name);
            else
                nameMap.set(
                    file.name,
                    `${uuid().split('-')[0]}.${file.name.split('.').findLast((v) => typeof v === 'string')}`
                );
        }

        // replace duplicate files
        // Optimized: compute all hashes first, then find duplicates in O(n) instead of O(n²)
        const refrenceMap: Map<string, { new: string; layers: number }> = new Map();
        const hashMap: Map<string, string> = new Map();
        const hashToFiles: Map<string, string[]> = new Map();
        
        // First pass: compute all file hashes in parallel
        const files = readdirSync('static', { recursive: true, withFileTypes: true })
            .filter(file => file.isFile() && !file.isSymbolicLink() && !file.name.endsWith('.html'))
            .map(file => `${file.parentPath}/${file.name}`)
            .filter(filePath => existsSync(filePath));
        
        // Compute hashes in parallel for better performance
        const hashPromises = files.map(async (filePath) => {
            const hash = await getFileHash(filePath);
            return { filePath, hash };
        });
        
        const fileHashes = await Promise.all(hashPromises);
        
        // Build hash maps
        for (const { filePath, hash } of fileHashes) {
            hashMap.set(filePath, hash);
            if (!hashToFiles.has(hash)) {
                hashToFiles.set(hash, []);
            }
            hashToFiles.get(hash)!.push(filePath);
        }
        
        // Second pass: identify duplicates and remove them
        for (const [hash, filePaths] of hashToFiles) {
            if (filePaths.length <= 1) continue;
            
            // Keep the first file, remove the rest
            const [keepFile, ...duplicateFiles] = filePaths;
            const fileName = keepFile.split('/').pop()!;
            
            for (const duplicateFile of duplicateFiles) {
                const dupFileName = duplicateFile.split('/').pop()!;
                rmSync(duplicateFile, { force: true });
                
                // paths will always have at least 1 separator, so it is safe to subtract 2
                refrenceMap.set(dupFileName, {
                    new: nameMap.get(fileName) ?? fileName,
                    layers: duplicateFile.split('/').length - 2
                });
            }
        }
        
        // Rename remaining files
        for (const filePath of files) {
            if (!existsSync(filePath)) continue; // Skip deleted duplicates
            const fileName = filePath.split('/').pop()!;
            const newName = nameMap.get(fileName);
            if (newName && newName !== fileName) {
                renameSync(filePath, filePath.replace(fileName, newName));
            }
        }

        // update references and file names
        // this will load the entire file into memory at once :(
        for (const file of readdirSync('static', { recursive: true, withFileTypes: true })) {
            if (!file.isFile() || file.isSymbolicLink()) continue;
            const filePath = `${file.parentPath}/${file.name}`;

            let content = readFileSync(filePath, 'utf-8');
            for (const [name, data] of refrenceMap) {
                // update layers to be relevant to the current file
                data.layers = data.layers - (data.layers - (filePath.split('/').length - 2));
                if (data.layers === 0) content = content.replace(`./${name}`, `./${data.new}`);
                else content = content.replace(`./${name}`, `${'../'.repeat(data.layers)}${data.new}`);
            }
            for (const [old, value] of nameMap) {
                content = content.replace(old, value);
            }
            writeFileSync(filePath, content, 'utf8');
        }
    }
    //log(
    //    'debug',
    //    `(build) Duplicate files removed and their references updated.${isDev ? '' : ' (File names minified as well.)'}`
    //);

    // create symlinks for doc files
    for (const file of readdirSync('src/client/docs/.vitepress/dist/', { recursive: true, withFileTypes: true })) {
        if (file.isFile()) {
            let path = file.parentPath.replace('src/client/docs/.vitepress/dist/', '');
            if (path === 'src/client/docs/.vitepress/dist') path = '';
            else path = `${path}/`;
            const destinationPath = `static/docs/${path}`;
            createPath(destinationPath);
            symlinkSync(safelyGetPath(`${file.parentPath}/${file.name}`), `${destinationPath}${file.name}`);
        }
    }

    // minify (in prod)
    if (!isDev) {
        for (const file of readdirSync('static/', { recursive: true, withFileTypes: true })) {
            if (file.isFile()) {
                // minify html
                if (file.name.endsWith('.html')) {
                    const path = `${file.parentPath}/${file.name}`;
                    const content = readFileSync(path, 'utf8');
                    const minified = await minify(content, {
                        minifyCSS: true,
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
                        mangle: true
                    });
                    writeFileSync(path, minified.code ?? '');
                }
                // not going to minify css due to it already being minified pretty well by bun
            }
        }
        //log('debug', '(build) Files minified.');
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
            let content = readFileSync(filePath, 'utf-8');
            content = await prettier.format(content, Object.assign(config, { filepath: filePath }));
            writeFileSync(filePath, content, 'utf8');
        }
    }
}

/**
 * Development function that rebuilds the frontend on file changes in `src/client/`.
 * Uses debouncing to avoid rebuilding too frequently.
 */
export function hotReloadFrontend() {
    let rebuildTimer: Timer | null = null;
    let isRebuilding = false;

    const triggerRebuild = () => {
        // Clear any pending rebuild
        if (rebuildTimer) {
            clearTimeout(rebuildTimer);
        }
        
        // Debounce: wait 1 second after the last change before rebuilding
        rebuildTimer = setTimeout(async () => {
            if (isRebuilding) return;
            
            isRebuilding = true;
            try {
                await buildFrontend();
            } catch (error) {
                log('error', 'Hot reload build failed:', error);
            } finally {
                isRebuilding = false;
            }
        }, 1000);
    };

    chokidar.watch('src/client/').on('all', triggerRebuild);
}
