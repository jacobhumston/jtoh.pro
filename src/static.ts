import type { Hono } from 'hono';
import { extname, join, normalize } from 'path';
import fs from 'node:fs';
import mime from 'mime-types';
import cleanCSS from 'clean-css';
import minifyHTML from 'html-minifier';
import { minify as minifyJS } from 'terser';
import { isDev } from './dev';
import { Transpiler } from 'bun';
import logger from './logger';
import { v4 as uuid } from 'uuid';

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

const transpiler = new Transpiler({ target: 'browser', loader: 'ts' });
const pageIds: { [key: string]: string } = {};

export default async function serveStatic(app: Hono) {
    app.use('/*', async (context, next) => {
        let path = context.req.path;
        const reqPath = context.req.path;
        const searchParams = new URL(context.req.url).searchParams;
        const searchParamsString = searchParams.toString().length > 0 ? '?' + searchParams.toString() : '';

        if (path.endsWith('/')) {
            path = `${path}index.html`;
        }

        path = normalize(path).replace(/^(\.\.(\/|\\|$))+/, '');

        let filePath = join(__dirname, 'web', path);
        let fileExt = extname(filePath);

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            filePath = join(__dirname, 'web', path + '.html');
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
                    ogCode = transpiler.transformSync(ogCode);
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
                            drop_console: !isDev,
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
            file = Buffer.from(
                minifyHTML
                    .minify(content, {
                        quoteCharacter: "'",
                        collapseWhitespace: true,
                        removeComments: true,
                        removeAttributeQuotes: true
                    })
                    .replaceAll('{{pageId}}', pageId)
                    .replaceAll('{{currentYear}}', new Date().getFullYear().toString())
            );
        }

        if (fileExt === '.ts') fileExt = '.js';

        context.header('Content-Type', mime.lookup(fileExt) || 'application/octet-stream');
        context.header('Cache-Control', 'public, max-age=31536000');

        return context.body(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as any);
    });
}

export function getPageFromId(id: string) {
    for (const [page, pageId] of Object.entries(pageIds)) {
        if (pageId === id) return page;
    }
    return null;
}
