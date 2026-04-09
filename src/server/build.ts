/**
 * A simple build entry point.
 * This allows the app to be built without running any other code.
 * Note: Use "--skipBuild true" with boot.ts to skip building in the main process.
 *
 * Authored by Jacob Humston
 */
import { generateSiteMap } from '@server/managers/sitemap';
import { buildFrontend } from '@server/managers/web';

await buildFrontend();
await generateSiteMap();
