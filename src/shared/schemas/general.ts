/**
 * General schemes, such as errors.
 *
 * Authored by Jacob Humston
 */
import { z } from '@hono/zod-openapi';

/** Schema that represents an error message. */
export const errorScheme = z
    .object({
        error: z.string().openapi({ description: 'The error message.' })
    })
    .openapi({ description: 'Error Schema' });

/** `errorSchema` type. */
export type ErrorScheme = z.infer<typeof errorScheme>;
