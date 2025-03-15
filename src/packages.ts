import type { Hono } from 'hono';
import type { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import fs from 'node:fs';

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

        const smallerPackages = packages.map((pkg) => {
            return {
                name: pkg.name,
                description: pkg.description,
                version: pkg.version,
                url: 'https://www.npmjs.com/package/' + pkg.name
            };
        });

        cache = smallerPackages;

        return context.json({ count: smallerPackages.length, packages: smallerPackages });
    });
}
