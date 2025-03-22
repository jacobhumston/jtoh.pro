import type { Hono } from 'hono';
import type { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import fs from 'node:fs';
import ourPackage from '../package.json';

export default function listenForPackageLists(app: Hono) {
    let cache: any = null;

    app.get('/api/credits/packages', async (context) => {
        if (cache) return context.json({ count: cache.length, packages: cache });

        const packages: JSONSchemaForNPMPackageJsonFiles[] = [];
        for (const thisPackage of fs.readdirSync('node_modules/')) {
            if (thisPackage.startsWith('.')) continue;
            if (thisPackage.startsWith('@')) {
                for (const thisSubPackage of fs.readdirSync(`node_modules/${thisPackage}/`)) {
                    packages.push(
                        JSON.parse(
                            fs.readFileSync(`node_modules/${thisPackage}/${thisSubPackage}/package.json`, 'utf-8')
                        )
                    );
                }
                continue;
            }
            packages.push(JSON.parse(fs.readFileSync(`node_modules/${thisPackage}/package.json`, 'utf-8')));
        }

        let smallerPackages = packages
            .map((pkg) => {
                return {
                    name: pkg.name as string,
                    description: pkg.description ?? 'No description.',
                    version: pkg.version as string,
                    url: 'https://www.npmjs.com/package/' + pkg.name,
                    isSub:
                        // @ts-expect-error
                        ourPackage.dependencies[pkg.name as string] || ourPackage.devDependencies[pkg.name as string]
                            ? false
                            : true
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));

        /*
        const stared = smallerPackages.filter((pkg) => !pkg.isSub);
        const notStarted = smallerPackages.filter((pkg) => pkg.isSub);

        smallerPackages = [];
        smallerPackages.push(...stared);
        smallerPackages.push(...notStarted);
        */

        cache = smallerPackages;

        return context.json({ count: smallerPackages.length, packages: smallerPackages });
    });
}
