import type { Hono } from 'hono';
import type { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import fs from 'node:fs';
import ourPackage from '../package.json';

export default function listenForPackageLists(app: Hono) {
    let cache: any = null;
    let licenseCache: any = null;

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

    app.get('/api/credits/packages/licenses.txt', async (context) => {
        if (licenseCache)
            return context.text(licenseCache, 200, {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=86400'
            });

        function addLicense(p1: string, p2?: string): string | null {
            const basePath = p2 ? `node_modules/${p1}/${p2}` : `node_modules/${p1}`;
            const licenseFiles = [
                'LICENSE',
                'LICENSE.md',
                'license',
                'license.md',
                'LICENCE',
                'LICENCE.md',
                'licence',
                'licence.md',
                'License',
                'License.md',
                'License.txt',
                'license.txt',
                'LICENSE.txt',
                'LICENSE-MIT.txt',
                'LICENSE.BSD',
                'LICENSE-MIT',
                'LICENSE.MIT',
                'LICENSE-APACHE.txt',
                'license-mit'
            ];
            for (const licenseFile of licenseFiles) {
                const filePath = `${basePath}/${licenseFile}`;
                if (fs.existsSync(filePath)) {
                    return fs.readFileSync(filePath, 'utf-8') + `\n\nSource: ${filePath.replace('node_modules/', '')}`;
                }
            }
            return null;
        }

        const licenses: string[] = [];
        let noLicense: string[] = [];
        for (const thisPackage of fs.readdirSync('node_modules/')) {
            if (thisPackage.startsWith('.')) continue;
            if (thisPackage.startsWith('@')) {
                for (const thisSubPackage of fs.readdirSync(`node_modules/${thisPackage}/`)) {
                    const license = addLicense(thisPackage, thisSubPackage);
                    if (license) licenses.push(license);
                    else noLicense.push(`${thisPackage}/${thisSubPackage}`);
                }
                continue;
            }
            const license = addLicense(thisPackage);
            if (license) licenses.push(license);
            else noLicense.push(thisPackage);
        }

        noLicense.sort();
        const pkgSortByLength = noLicense.toSorted((a, b) => b.length - a.length);
        noLicense = noLicense.map((pkg) => {
            const files = fs.readdirSync(`node_modules/${pkg}/`);
            const found = files.find((file) => file.toLowerCase().includes('license'));
            const stringPadding = pkgSortByLength[0].length - pkg.length;
            return (
                pkg +
                (found ? `${`${stringPadding > 0 ? ' '.repeat(stringPadding) : ''} | Possible match: ${found}`}` : '')
            );
        });

        licenseCache =
            licenses.join('\n\n<[|]<<------------------------------------------------>>[|]>\n\n') +
            '\n\n<[|]<<------------------------------------------------>>[|]>\n\nNo license found for:\n* ' +
            noLicense.join('\n* ');
        return context.text(licenseCache, 200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400'
        });
    });
}
