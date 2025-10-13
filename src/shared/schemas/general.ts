/**
 * General schemes, such as errors.
 *
 * Authored by Jacob Humston
 */
import { z } from '@hono/zod-openapi';

/** Schema that represents an error message. */
export const errorSchema = z
    .object({
        error: z.string().openapi({ description: 'The error message.' })
    })
    .openapi({ description: 'Error Schema' });

/** `errorSchema` type. */
export type ErrorSchema = z.infer<typeof errorSchema>;

/** Schema that represents the version of something. */
export const versionSchema = z
    .object({
        version: z.string().openapi({ description: 'The current version.' })
    })
    .openapi({ description: 'Version Schema' });

/** `versionSchema` type. */
export type VersionSchema = z.infer<typeof versionSchema>;
