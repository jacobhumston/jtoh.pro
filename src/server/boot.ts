/**
 * Main file of the server, responsible for starting the server.
 *
 * Authored by Jacob Humston
 */
import { OpenAPIHono, z } from '@hono/zod-openapi';
import { compress } from 'hono/compress';
import { secureHeaders } from 'hono/secure-headers';

import { readdirSync } from 'node:fs';

import { listenForDiscordRequests } from '@discord/bot';
import config, { serverURL, version } from '@server/config';
import { getBooleanArg } from '@server/managers/argv';
import { generateSiteMap } from '@server/managers/sitemap';
import { buildFrontend, hotReloadFrontend, serveStatic } from '@server/managers/web';
import { cleanUpLogs, log } from '@server/modules/logger';
import rateLimitMiddleware from '@server/modules/ratelimits';
import '@server/modules/secrets';

// create the hono application
const app = new OpenAPIHono({
    strict: true,
    defaultHook: (result, context) => {
        if (!result.success) {
            return context.json({ error: z.prettifyError(result.error) }, 400);
        }
    }
});

// log cleanup
cleanUpLogs();

// global rate limit
app.use(rateLimitMiddleware({ pool: 120, reset: { minutes: 1 }, customPrefix: 'global' }));

// utility middlewares
app.use(secureHeaders());
app.use(compress());

// build and serve pages/assets/etc
await buildFrontend();
await generateSiteMap();
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
await listenForDiscordRequests(app);

// get spec information and expose it
const spec = app.getOpenAPI31Document({
    openapi: '3.1.0',
    servers: [{ url: serverURL.href }],
    info: {
        title: 'jtoh.pro API',
        description: 'API documentation for the jtoh.pro client.',
        version: version,
        contact: { email: 'support@jtoh.pro', name: 'jtoh.pro Support' },
        termsOfService: `/legal/terms`
    },
    tags: [
        { name: 'Cards', description: 'Endpoints that allow you to customize cards, etc.' },
        {
            name: 'Security',
            description: "Endpoints that either enhance or support the security of the website's interface."
        },
        {
            name: 'Utility',
            description:
                'Utility endpoints that either provide useful information or have helpful features to improve the general experience.'
        },
        {
            name: 'Administrative',
            description: 'Endpoints that enable administrative actions to be performed more effectively.'
        }
    ].sort((a, b) => a.name.localeCompare(b.name))
});

app.get('/api/spec', (context) => {
    // TODO: hide private spec to those who need it
    return context.json(spec);
});

// handle 404s
app.notFound((context) => {
    context.status(404);
    if (context.req.path.startsWith('/api')) return context.json({ error: 'The requested path was not found.' }) as any;
    return context.redirect('/404');
});

// last resort, errors...
app.onError((error, context) => {
    log('error', error);
    return context.json({ error: 'Internal server error.' }, 500);
});

// hot reloading for development
if ((await getBooleanArg('hotBuild')) === true)
    (hotReloadFrontend(), log('info', 'Hot reloading enabled for the frontend. Sitemaps will be unavailable.'));

// export server options for bun
export default { fetch: app.fetch, port: config.serverPort } satisfies Bun.Serve.Options<any>;

// log config for convenience
log('info', `Server started with the following config: ${JSON.stringify(config)}`);
