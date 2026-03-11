/**
 * Main file of the server, responsible for starting the server.
 *
 * Authored by Jacob Humston
 */
import { OpenAPIHono, z } from '@hono/zod-openapi';
import { compress } from 'hono/compress';
import { secureHeaders } from 'hono/secure-headers';

import { serve } from 'bun';
import { readdirSync, readFileSync } from 'node:fs';
import process from 'node:process';

import { listenForDiscordRequests } from '@discord/bot';
import config, { isDev, serverPort, serverURL, version } from '@server/config';
import { getBooleanArg } from '@server/managers/argv';
import { getAuthenticatedRobloxUser } from '@server/managers/auth';
import { contextHasPermission } from '@server/managers/permissions';
import { redirectMiddleware } from '@server/managers/redirects';
import { generateSiteMap } from '@server/managers/sitemap';
import { buildFrontend, hotReloadFrontend, serveStatic } from '@server/managers/web';
import { analytics } from '@server/modules/analytics';
import { getIPFromContext } from '@server/modules/ip';
import { cleanUpLogs, log, logError } from '@server/modules/logger';
import rateLimitMiddleware from '@server/modules/ratelimits';
import { safeURL } from '@shared/common-utils';

// create the hono application
const app = new OpenAPIHono({
    strict: true,
    defaultHook: (result, context) => {
        if (!result.success) {
            return context.json({ error: z.prettifyError(result.error) }, 400);
        }
    },
    // adds support for user profile urls
    getPath: (request) => {
        const host = request.headers.get('host');
        const path = safeURL(request.url)?.pathname ?? '/';
        if (!host) return path;
        if (
            (host.endsWith('.etoh.pro') || host.endsWith('.roblox-obby.pro')) &&
            !path.includes('assets') &&
            !path.includes('api') &&
            !path.endsWith('.js') &&
            !path.endsWith('.css')
        )
            return `/profiles/${host.split('.')[0]}`;
        return path;
    }
});

// log cleanup
cleanUpLogs();

// host protection
app.use(async (context, next) => {
    const host = context.req.header('Host');
    if (!host) return context.json({ error: 'Missing host.' });
    // support user profiles
    if (host.endsWith('.etoh.pro') || host.endsWith('.roblox-obby.pro')) return await next();
    if (host !== serverURL.host) return context.redirect(serverURL);
    return await next();
});

// global rate limit
app.use(rateLimitMiddleware({ pool: 120, reset: { minutes: 1 }, customPrefix: 'global' }));

// utility middlewares
app.use(secureHeaders());
app.use(compress());
app.use(redirectMiddleware);

// analytics
app.use((context, next) => {
    (async () => {
        const user = await getAuthenticatedRobloxUser(context);
        await analytics
            .track({
                type: 'custom_event',
                ip_address: getIPFromContext(context),
                event_name: 'request',
                properties: {
                    host: context.req.header('Host'),
                    method: context.req.method,
                    path: context.req.path
                },
                user_agent: context.req.header('User-Agent'),
                user_id: user ? user.username : undefined
            })
            .catch(logError);
    })();
    return next();
});

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
    const file: { handler: (app: OpenAPIHono) => Promise<void> | void } = await import(
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
        description: readFileSync('src/client/assets/api-description.md', 'utf8'),
        version: version,
        contact: { email: 'support@jtoh.pro', name: 'jtoh.pro Support' },
        termsOfService: `/terms`
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
        },
        {
            name: 'Merch',
            description: 'Merch related endpoints, such as getting a list of items.'
        },
        {
            name: 'Authentication',
            description: 'Authentication endpoints used to authorize users with other services.'
        }
    ].sort((a, b) => a.name.localeCompare(b.name))
});

app.get('/api/spec', async (context) => {
    const hasPrivateAccess = await contextHasPermission(context, 'Private API Documentation', 'read');
    if (!hasPrivateAccess && !isDev) return context.json({ error: 'Not found.' }, 404);
    return context.json(spec);
});

// handle 404s
app.notFound((context) => {
    context.status(404);
    if (context.req.path.startsWith('/api')) return context.json({ error: 'The requested path was not found.' });
    return context.redirect(`/404?from=${context.req.path}`);
});

// last resort, errors...
app.onError(async (error, context) => {
    log('error', error);
    const user = await getAuthenticatedRobloxUser(context);
    await analytics
        .track({
            type: 'custom_event',
            ip_address: getIPFromContext(context),
            event_name: 'server-error',
            properties: {
                host: context.req.header('Host'),
                method: context.req.method,
                path: context.req.path,
                error: Bun.inspect(error)
            },
            user_agent: context.req.header('User-Agent'),
            user_id: user ? user.username : undefined
        })
        .catch(logError);
    return context.json({ error: 'Internal server error.' }, 500);
});

// hot reloading for development
if ((await getBooleanArg('hotBuild')) === true) {
    hotReloadFrontend();
    log('info', 'Hot reloading enabled for the frontend. Sitemaps will be unavailable.');
}

// export server options for bun
try {
    serve({ fetch: app.fetch, port: serverPort });
} catch (error) {
    log('error', error);
    log('info', 'Unable to start server, maybe run "bun run port-access"?');
    process.exit();
}

// log config for convenience
log('info', `Server started with the following config: ${JSON.stringify(config)}`);
