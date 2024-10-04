import type { Hono } from 'hono';
import { extname, join, normalize } from 'path';
import uglifyJs from 'uglify-js';
import fs from 'node:fs';
import mime from 'mime-types';
import cleanCSS from 'clean-css';
import minifyHTML from 'html-minifier';

export default async function serveStatic(app: Hono) {
    app.use('/*', async (context, next) => {
        let path = context.req.path;
        const reqPath = context.req.path;

        if (!path.includes('.')) {
            if (path.endsWith('/')) {
                path = `${path}index.html`;
            } else {
                path = `${path}.html`;
            }
        }

        path = normalize(path).replace(/^(\.\.(\/|\\|$))+/, '');

        const filePath = join(__dirname, 'web', path);
        const fileExt = extname(filePath);

        if (!fs.existsSync(filePath)) {
            return next();
        } else {
            if (reqPath.endsWith('.html')) return context.redirect(reqPath.slice(0, -5));
        }

        let file = fs.readFileSync(filePath);

        if (fileExt === '.js') {
            file = Buffer.from(uglifyJs.minify(file.toString()).code);
        } else if (fileExt === '.css') {
            file = Buffer.from(new cleanCSS().minify(file.toString()).styles);
        } else if (fileExt === '.html') {
            let content = file.toString();
            for (const file of fs.readdirSync(join(__dirname, 'web', 'app', 'templates'))) {
                if (file.endsWith('.html')) {
                    const name = file.slice(0, -5);
                    const thisContent = fs.readFileSync(join(__dirname, 'web', 'app', 'templates', file)).toString();
                    content = content.replaceAll(`<template data-name="${name}"></template>`, thisContent);
                }
            }
            file = Buffer.from(
                minifyHTML.minify(content, {
                    quoteCharacter: "'",
                    collapseWhitespace: true,
                    removeComments: true,
                    removeAttributeQuotes: true
                })
            );
        }

        context.header('Content-Type', mime.lookup(fileExt) || 'application/octet-stream');
        return context.body(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as any);
    });
}
