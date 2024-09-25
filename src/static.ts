import type { Hono } from 'hono';
import { extname, join, normalize } from 'path';
import uglifyJs from 'uglify-js';
import fs from 'node:fs';
import mime from 'mime-types';
import cleanCSS from 'clean-css';

export default async function serveStatic(app: Hono) {
    app.use('/*', async (context, next) => {
        let path = context.req.path;
        if (!path.includes('.') && path.endsWith('/')) {
            path = `${path}index.html`;
        }
        path = normalize(path).replace(/^(\.\.(\/|\\|$))+/, '');

        const filePath = join(__dirname, 'web', path);
        const fileExt = extname(filePath);

        if (!fs.existsSync(filePath)) {
            return next();
        }

        let file = fs.readFileSync(filePath);

        if (fileExt === '.js') {
            file = Buffer.from(uglifyJs.minify(file.toString()).code);
        } else if (fileExt === '.css') {
            file = Buffer.from(new cleanCSS().minify(file.toString()).styles);
        }

        context.header('Content-Type', mime.lookup(fileExt) || 'application/octet-stream');
        return context.body(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as any);
    });
}
