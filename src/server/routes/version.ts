/**
 * Simple route that exposes the current version.
 * The version is the git hash of the commit that the current local repo is on.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { $ } from 'bun';

import { versionSchema } from '../../shared/schemas/general';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/version',
    description: 'Get the current version of jtoh.pro',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: versionSchema
                }
            },
            description: 'The current version.'
        }
    }
});

/** Handle fpr this endpoint. */
export async function handler(app: OpenAPIHono) {
    const version = (await $`git rev-parse --short HEAD`.text()).replace('\n', '');
    app.openapi(route, (context) => {
        return context.json({ version: version }, 200);
    });
}
