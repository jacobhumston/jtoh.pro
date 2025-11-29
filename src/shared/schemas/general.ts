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

/** Schema that represents a rate limit error. */
export const rateLimitErrorSchema = z.object({
    error: z.string().openapi({ description: 'The error message.' }),
    reset: z.iso.datetime().openapi({ description: 'Date that this rate limit will reset.' })
});

/** `rateLimitErrorSchema` type. */
export type RateLimitErrorSchema = z.infer<typeof rateLimitErrorSchema>;

/** Schema that represents a client update response. */
export const clientUpdateSchema = z.object({
    update: z.boolean().openapi({ description: 'A boolean indicating if the client needs updated or not.' }),
    version: z.string().openapi({ description: 'The current version for refrence.' })
});

/** `clientUpdateSchema` type. */
export type ClientUpdateSchema = z.infer<typeof clientUpdateSchema>;
