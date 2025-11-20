/**
 * Main file of the server, responsible for starting the server.
 *
 * Authored by Jacob Humston
 */
import { OpenAPIHono, z } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { secureHeaders } from 'hono/secure-headers';
import { compile } from 'sass';

import { $ } from 'bun';
import { readdirSync } from 'node:fs';

import config from './config';
//import { bootDiscordBot } from './discord/bot';
import { getBooleanArg } from './managers/argv';
import { buildFrontend, hotReloadFrontend, serveStatic } from './managers/web';
import { cleanUpLogs, log } from './modules/logger';
import './modules/secrets';

// create the hono application
const app = new OpenAPIHono({
    strict: true,
    defaultHook: (result, context) => {
        if (!result.success) {
            return context.json({ error: z.formatError(result as any)._errors.join('\n') }, 400);
        }
    }
});

// log cleanup
cleanUpLogs();

// utility middlewares
app.use(secureHeaders());

// build and serve pages/assets/etc
await buildFrontend();
serveStatic(app);

// call the handler method for each route
// do this alphabetically, so the api docs are sorted nicely :)
for (const route of readdirSync('src/server/routes/', { recursive: true, withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
)) {
    if (!route.isFile()) continue;
    // no error handling for missing handlers as we want that issue to crash the application
    const file: { handler: (app: OpenAPIHono) => Promise<any> | any } = await import(
        `${route.parentPath.replace('src/server/', './')}/${route.name}`
    );
    file.handler(app);
}

// boot up the Discord bot
//await bootDiscordBot(app);

// use Scalar middleware for api docs
// we also need to expose the spec information
app.doc31('/api/spec', {
    openapi: '3.1.0',
    info: {
        title: 'jtoh.pro API',
        version: `${(await $`git rev-parse --short HEAD`.text()).replace('\n', '')}`,
        contact: { email: 'support@jtoh.pro', name: 'jtoh.pro Support' }
    }
});
app.use(
    '/api',
    Scalar({
        url: '/api/spec',
        showDeveloperTools: 'never',
        hideClientButton: true,
        customCss: compile('src/client/css/api.scss').css,
        pageTitle: 'jtoh.pro API Reference',
        withDefaultFonts: false,
        hideDarkModeToggle: true
    })
);

// last resort, errors...
app.onError((error, context) => {
    log('error', error);
    return context.json({ error: 'Internal server error.' }, 500);
});

// hot reloading for development
if ((await getBooleanArg('hot-build')) === true)
    (hotReloadFrontend(), log('info', 'Hot reloading enabled for the frontend.'));

// export server options for bun
export default { fetch: app.fetch, port: config.serverPort } satisfies Bun.Serve.Options<any>;

// log config for convenience
log('info', `Server started with the following config: ${JSON.stringify(config)}`);
