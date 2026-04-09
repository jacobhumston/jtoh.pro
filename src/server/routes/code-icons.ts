/**
 * Route that returns code icon details.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { generateManifest } from 'material-icon-theme';

import { errorSchema, rateLimitErrorSchema } from '@schemas/general';
import { serverURL } from '@server/config';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/code-icons',
    description: 'Get details for code icons.',
    tags: ['Utility'],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z
                        .object({
                            files: z.record(z.string(), z.url()).openapi({ description: 'Files name mappings.' }),
                            folders: z.record(z.string(), z.url()).openapi({ description: 'Folder name mappings.' })
                        })
                        .openapi('IconDetailsSchema')
                }
            },
            description: 'Code icon details result.'
        },
        429: {
            content: {
                'application/json': {
                    schema: rateLimitErrorSchema
                }
            },
            description: 'Rate limit error.'
        },
        500: {
            content: {
                'application/json': {
                    schema: errorSchema
                }
            },
            description: 'Internal server error.'
        }
    }
});

/** Handle for this endpoint. */
export async function handler(app: OpenAPIHono) {
    const manifest = generateManifest();
    const files = manifest.fileNames ?? {};
    const folders = manifest.folderNames ?? {};

    for (const key of Object.keys(files)) files[key] = `${serverURL}assets/code-icons/${files[key]}.svg`;
    for (const key of Object.keys(folders)) folders[key] = `${serverURL}assets/code-icons/${folders[key]}.svg`;

    app.openapi(route, (context) => {
        return context.json({ files, folders }, 200);
    });
}
