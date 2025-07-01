import * as esbuild from 'esbuild';
import fs from 'node:fs';
import { minify as minifyJS } from 'terser';
import logger from './logger';
import { isDev } from './dev';

const cache: { [key: string]: string } = {};

export async function getJSForPage(pageName: string) {
    const cacheId = pageName;

    if (cache[cacheId] && !isDev) {
        return cache[cacheId];
    }

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
        outfile: `temp/client-js-${pageName}.js`,
        treeShaking: true,
        write: false,
        external: filesToExclude,
        platform: 'browser',
        target: 'esnext'
    });

    let code = result.outputFiles[0].text;

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
                    drop_console: false,
                    booleans_as_integers: true,
                    arguments: true,
                    unsafe: true,
                    passes: 4,
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

    cache[cacheId] = code;

    return code;
}
