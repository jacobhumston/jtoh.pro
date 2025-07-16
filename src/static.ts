import type { Hono } from 'hono';
import { extname, join, normalize } from 'path';
import fs from 'node:fs';
import mime from 'mime-types';
import cleanCSS from 'clean-css';
import minifyHTML from 'html-minifier';
import { minify as minifyJS } from 'terser';
import { getURL, isDev } from './dev';
//import { Transpiler } from 'bun';
import logger from './logger';
import { v4 as uuid } from 'uuid';
import { getJSForPage } from './js';
//import { PurgeCSS } from 'purgecss';
import * as esbuild from 'esbuild';

let cssCache: null | string = null;

function getCSS() {
    if (cssCache) return cssCache;
    const styles: string[] = [];
    for (const file of fs.readdirSync('src/client/css/')) {
        if (file.endsWith('.css')) {
            styles.push(fs.readFileSync(`src/client/css/${file}`).toString());
        }
    }
    const result = new cleanCSS({ level: 2 }).minify(styles.join('\n')).styles;
    if (!isDev) cssCache = result;
    return result;
}

function replaceTemplates(content: string, templateDir: string, stop: boolean = false): string {
    const files = fs.readdirSync(templateDir);
    for (const file of files) {
        if (file.endsWith('.html')) {
            const name = file.slice(0, -5);
            const thisContent = fs.readFileSync(join(templateDir, file)).toString();
            const replacedContent = stop ? thisContent : replaceTemplates(thisContent, templateDir, true);
            content = content.replaceAll(`<template data-name="${name}"></template>`, replacedContent);
        }
    }
    return content;
}

//const transpiler = new Transpiler({ target: 'browser', loader: 'ts' });
const pageIds: { [key: string]: string } = {};

export default async function serveStatic(app: Hono) {
    app.use('/*', async (context, next) => {
        let path = context.req.path;
        const reqPath = context.req.path;
        const searchParams = new URL(context.req.url).searchParams;
        const searchParamsString = searchParams.toString().length > 0 ? '?' + searchParams.toString() : '';

        if (path.endsWith('/')) {
            path = `${path}index`;
        }

        path = normalize(path).replace(/^(\.\.(\/|\\|$))+/, '');

        let filePath = join(__dirname, 'web', path);
        let fileExt = extname(filePath);

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            filePath = join(__dirname, 'web', path + '.html');
            fileExt = extname(filePath);
        }

        if (!fs.existsSync(filePath) || (!fs.statSync(filePath).isFile() && path.endsWith('.js'))) {
            filePath = join(__dirname, 'web', path.substring(0, path.length - 3) + '.ts');
            fileExt = extname(filePath);
        }

        if (!fs.existsSync(filePath)) {
            return next();
        } else {
            if (reqPath.endsWith('.html')) return context.redirect(reqPath.slice(0, -5) + searchParamsString);
        }

        let file = fs.readFileSync(filePath);

        if (fileExt === '.js' || fileExt === '.ts') {
            let ogCode = file.toString();
            if (fileExt === '.ts') {
                try {
                    const result = await esbuild.build({
                        entryPoints: [filePath],
                        minify: true,
                        format: 'esm',
                        bundle: true,
                        logLevel: 'silent',
                        outfile: `temp/client-js-${path}.js`,
                        treeShaking: true,
                        write: false,
                        platform: 'browser'
                    });
                    ogCode = result.outputFiles[0].text;
                    ogCode = `(async()=>{${ogCode}})();`;
                    ogCode = ogCode.replaceAll('{{URL}}', getURL());
                } catch (error) {
                    logger.error(error);
                    ogCode = '';
                }
            }
            console;
            let code =
                (
                    await minifyJS(ogCode, {
                        mangle: true,
                        module: fileExt === '.ts',
                        compress: {
                            ecma: 2020,
                            hoist_funs: true,
                            drop_console: false,
                            booleans_as_integers: true,
                            arguments: true,
                            unsafe: true,
                            passes: 3,
                            unsafe_Function: true,
                            unsafe_math: true,
                            unsafe_methods: true,
                            unsafe_proto: true,
                            toplevel: true,
                            module: true,
                            reduce_vars: true,
                            inline: true,
                            collapse_vars: true,
                            pure_getters: true
                        },
                        output: {
                            comments: false
                        }
                    }).catch((error) => {
                        logger.error(error);
                        return { code: '' };
                    })
                ).code ?? '';

            file = Buffer.from(code);
        } else if (fileExt === '.css') {
            file = Buffer.from(
                new cleanCSS({
                    level: 2
                }).minify(file.toString()).styles
            );
        } else if (fileExt === '.html') {
            const pageName = path.split('/').pop() ?? '';
            const pageId = pageIds[pageName] || uuid().split('-')[0];
            pageIds[pageName] = pageId;

            let content = file.toString();
            const templateDir = join(__dirname, 'web', 'app', 'templates');
            content = replaceTemplates(content, templateDir);

            /*
            const purgeCSSResult = await new PurgeCSS().purge({
                content: [{ extension: 'html', raw: content }],
                css: [{ name: 'css', raw: getCSS() }],
                safelist: ['loggedInDetails', 'loggedIn', 'loggedInName', 'loggedInIcon', 'dangerInfoBox']
            });
            */

            const minifiedContent = minifyHTML.minify(content, {
                quoteCharacter: "'",
                collapseWhitespace: true,
                removeComments: true,
                removeAttributeQuotes: true
            });

            const js = await getJSForPage(pageName);

            file = Buffer.from(
                minifiedContent
                    .replaceAll('{{pageId}}', pageId)
                    .replaceAll('{{currentYear}}', new Date().getFullYear().toString())
                    .replace('<style template=styles></style>', () => `<style>${getCSS()}</style>`)
                    .replace('<script template=js></script>', () => `<script>${js}</script>`)
            );
        }

        if (fileExt === '.ts') fileExt = '.js';

        context.header('Content-Type', mime.lookup(fileExt) || 'application/octet-stream');

        if (!isDev) {
            context.header('Cache-Control', 'public, max-age=31536000');
        } else {
            context.header('Cache-Control', 'no-store');
        }

        return context.body(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as any);
    });
}

export function getPageFromId(id: string) {
    for (const [page, pageId] of Object.entries(pageIds)) {
        if (pageId === id) return page;
    }
    return null;
}
