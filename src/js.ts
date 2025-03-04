import type { Hono } from 'hono';
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import { minify as minifyJS } from 'terser';
import logger from './logger';
import { getURL, getURLHost, isDev } from './dev';
import { getPageFromId } from './static';
import prettier from 'prettier';

const formatter = new Intl.NumberFormat('en-US');
const byteSize = (str: string) => new Blob([str]).size;
const cache: { [key: string]: string } = {};

export function serveJS(app: Hono) {
    app.get('/api/js', async (context) => {
        const id = context.req.query('v');
        if (!id) return context.json({ error: 'No version specified.' }, 400) as any;

        const pageName = getPageFromId(id) as string;
        if (pageName === null) return context.json({ error: 'Invalid version.' }, 400) as any;

        const cacheId = `${context.req.query('pretty') === 'true' ? 'pretty' : 'normal'}-${id}`;

        if (cache[cacheId] && !isDev) {
            context.header('Content-Type', 'application/javascript');
            context.header('Cache-Control', 'public, max-age=31536000');
            return context.body(cache[cacheId]);
        }

        const time = Date.now();

        const files: string[] = [];
        function addFile(dir: string) {
            const dirFiles = fs.readdirSync(dir);
            for (const file of dirFiles) {
                const filePath = `${dir}/${file}`;
                if (fs.statSync(filePath).isDirectory()) {
                    addFile(filePath);
                } else if (filePath.endsWith('.ts') && !filePath.includes('main.ts')) {
                    if (filePath.includes('core') && !filePath.includes(pageName)) {
                        files.push(filePath);
                    }
                }
            }
        }
        addFile('src/client/js');

        const filesToExclude = files.map((file) => {
            const filename = file.split('/').pop();
            if (!filename) return '';
            return './core/' + filename;
        });

        const result = await esbuild.build({
            entryPoints: ['src/client/js/main.ts'],
            minify: true,
            format: 'esm',
            bundle: true,
            logLevel: 'silent',
            outfile: `temp/client-js-${id}.js`,
            treeShaking: true,
            write: false,
            external: filesToExclude,
            platform: 'browser'
        });

        let code = result.outputFiles[0].text;
        const originalSize = byteSize(code);

        code = `(async()=>{${code}})();`;

        code =
            // @ts-ignore
            (
                await minifyJS(code, {
                    mangle: true,
                    module: false,
                    toplevel: true,
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

        for (const file of filesToExclude) {
            code = code
                .replace(`"${file}":()=>import("${file}"),`, '')
                .replace(`"${file}":()=>import("${file}")`, '')
                .replace(`"${file}"(){return import("${file}")},`, '')
                .replace(`"${file}"(){return import("${file}")}`, '');
        }

        code = code.replace('{{pageName}}', pageName.split('.')[0]);

        const size = byteSize(code);
        let pretty = false;
        let prettyCodeSize = 0;

        if (context.req.query('pretty') === 'true') {
            code = await prettier.format(code, { parser: 'babel' });
            pretty = true;
            prettyCodeSize = byteSize(code);
        }

        code = `// | Copyright   : Copyright of ${getURLHost()} (c) ${new Date().getFullYear()}. All rights reserved.
// | Date        : ${new Date().toDateString()}
// | Version     : ${id}
// | Cache ID    : ${cacheId} ${isDev ? '(Not cached in development mode)' : ''}
// | Bundle Size : ${formatter.format(size)} bytes 
// | Minified    : ${formatter.format(originalSize - size)} bytes saved
// | Pretty      : ${pretty ? 'Yes' : 'No'} ${pretty ? `(${formatter.format(prettyCodeSize - size)} bytes increased with a total of ${formatter.format(prettyCodeSize)} bytes)` : ''}
// | Build Time  : ${formatter.format(Date.now() - time)}ms
// | Request URL : ${getURL()}/api/js?v=${id}
\n${code}`;

        cache[cacheId] = code;

        context.header('Content-Type', 'application/javascript');

        if (!isDev) {
            context.header('Cache-Control', 'public, max-age=31536000');
        } else {
            context.header('Cache-Control', 'no-store');
        }

        return context.body(code);
    });
}
