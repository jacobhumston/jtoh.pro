/**
 * This route handles task management.
 *
 * Authored by Jacob Humston
 */
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { taskSchema, type TaskSchema } from '@schemas/admin';
import { errorSchema, rateLimitErrorSchema } from '@schemas/general';
import { getTasks } from '@server/managers/tasks';

/** Route for this endpoint. */
const route = createRoute({
    method: 'get',
    path: '/api/admin/tasks',
    description: 'Get a list of the current server tasks.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.array(taskSchema)
                }
            },
            description: 'List of tasks.'
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
    app.openapi(route, (context) => {
        const tasks: Array<TaskSchema> = [];
        const currentTasks = getTasks();

        for (const task of currentTasks) {
            tasks.push({
                name: task.name,
                description: task.description,
                id: task.id,
                temporary: task.temporary,
                nextRun: task.cron.nextDate().toISO(),
                lastRun: task.cron.lastDate()?.toISOString() ?? null
            });
        }

        return context.json(tasks, 200);
    });
}
