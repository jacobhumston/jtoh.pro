/**
 * This script is responsible for compiling
 * and serving assets, such as web pages.
 *
 * Authored by Jacob Humston
 */

import type { Hono } from 'hono';
import { safelyGetPath } from './files';
import { existsSync, rmSync, createReadStream } from 'node:fs';
import { parse } from 'node:path';
import { replaceEmptyString } from '../../shared/common-utils';
import { stream } from 'hono/streaming';
import { makeByteReadableStreamFromNodeReadable } from 'node-readable-to-web-readable-stream';
import mime from 'mime';

/** Path used to store static assets. */
export const staticPath = safelyGetPath('static');

/**
 * Clear the static directory.
 */
export function clearStatic() {
    rmSync(staticPath, { recursive: true, force: true });
    safelyGetPath('static'); // we still need the path afterwards
}

/**
 * Serve static files from the static directory.
 * @param app The server application.
 */
export function serveStatic(app: Hono) {
    app.get('', async (context) => {
        const path = parse(context.req.path);
        const name = replaceEmptyString(path.name, 'index');
        const dir = path.dir;
        const ext = replaceEmptyString(path.ext, '.html');
        const filePath = `${staticPath}${dir}/${name}${ext}`;

        if (!existsSync(filePath)) return context.status(404);
        context.res.headers.set('Content-Type', mime.getType(ext) ?? 'application/octet-stream');

        return stream(context, async (stream) => {
            const fileStream = createReadStream(filePath);
            await stream.pipe(makeByteReadableStreamFromNodeReadable(fileStream));
        });
    });
}
