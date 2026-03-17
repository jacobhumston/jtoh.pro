/**
 * Ping schemas.
 *
 * Authored by Jacob Humston
 */
import { z } from '@hono/zod-openapi';

/** Schema that represents a ping response. */
export const pingSchema = z
    .object({
        cloudflare: z.number().openapi({ description: 'Ping (in ms) to Cloudflare.' }),
        google: z.number().openapi({ description: 'Ping (in ms) to Google.' }),
        discord: z.number().openapi({ description: 'Ping (in ms) to Discord.' })
    })
    .openapi('PingSchema');

/** `pongSchema` type. */
export type PingSchema = z.infer<typeof pingSchema>;
