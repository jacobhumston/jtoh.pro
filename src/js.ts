import * as esbuild from 'esbuild';
import fs from 'node:fs';
import { minify as minifyJS } from 'terser';
import logger from './logger';
import { isDev } from './dev';
import prettier from 'prettier';

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
                if (filePath.includes('core') && !filePath.endsWith('/' + pageName + '.ts')) {
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
        minify: !isDev,
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

    if (!isDev) {
        code =
            // @ts-ignore
            (
                await minifyJS(code, {
                    mangle: true,
                    module: false,
                    toplevel: true,
                    compress: {
                        passes: 3,
                        toplevel: true,
                        module: true
                    },
                    output: {
                        comments: false
                    }
                }).catch((error) => {
                    logger.error(error);
                    return { code: '' };
                })
            ).code ?? '';
    }

    for (const file of filesToExclude) {
        code = code
            .replace(`"${file}":()=>import("${file}"),`, '')
            .replace(`"${file}":()=>import("${file}")`, '')
            .replace(`"${file}"(){return import("${file}")},`, '')
            .replace(`"${file}"(){return import("${file}")}`, '')
            .replace(`"${file}": () => import("${file}"),`, '');
    }

    code = code.replace('{{pageName}}', pageName.split('.')[0]);

    if (isDev) {
        code = await prettier.format(code, {
            parser: 'babel',
            trailingComma: 'none',
            tabWidth: 4,
            semi: true,
            singleQuote: true,
            printWidth: 120,
            useTabs: false,
            endOfLine: 'auto'
        });
    }

    cache[cacheId] = code;

    return code;
}
