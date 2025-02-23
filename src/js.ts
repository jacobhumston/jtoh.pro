import type { Hono } from 'hono';
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import { minify as minifyJS } from 'terser';
import logger from './logger';
import { getURLHost, isDev } from './dev';
import { getPageFromId } from './static';

const formatter = new Intl.NumberFormat('en-US');
const byteSize = (str: string) => new Blob([str]).size;

export function serveJS(app: Hono) {
    app.get('/api/js', async (context) => {
        const id = context.req.query('v');
        if (!id) return context.json({ error: 'No version specified.' }, 400) as any;

        const pageName = getPageFromId(id) as string;
        if (pageName === null) return context.json({ error: 'Invalid version.' }, 400) as any;

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

        let code =
            // @ts-ignore
            (
                await minifyJS(result.outputFiles[0].text, {
                    mangle: true,
                    module: true,
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

        code = `// Copyright of ${getURLHost()} (c) ${new Date().getFullYear()}
// V: ${id} - ${new Date().toDateString()}
// Bundle Size: ${formatter.format(byteSize(code))} bytes
\n${code}`;

        code = code.replace('{{pageName}}', pageName.split('.')[0]);

        context.header('Content-Type', 'application/javascript');
        context.header('Cache-Control', 'public, max-age=31536000');

        return context.body(code);
    });
}
