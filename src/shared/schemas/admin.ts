/**
 * Admin related schemas.
 *
 * Authored by Jacob Humston
 */
import { z } from '@hono/zod-openapi';

/** Schema that represents a task. */
export const taskSchema = z
    .object({
        name: z.string().openapi({ description: 'Name of this task.' }),
        description: z.string().openapi({ description: 'Description of this task.' }),
        id: z.uuidv4().openapi({ description: 'ID of this task.' }),
        temporary: z.boolean().openapi({ description: 'A boolean indicating whether this task is temporary or not.' }),
        nextRun: z.iso.datetime().nullable().openapi({ description: 'The next date that this task will run on.' }),
        lastRun: z.iso.datetime().nullable().openapi({ description: 'The last date that this task was run on.' })
    })
    .openapi('TaskSchema');

/** `tasksSchema` type. */
export type TaskSchema = z.infer<typeof taskSchema>;
