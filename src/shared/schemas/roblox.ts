/**
 * Roblox related schemas.
 *
 * Authored by Jacob Humston
 */
import { z } from '@hono/zod-openapi';

/** Schema that represents a roblox limited. */
export const robloxLimitedSchema = z
    .object({
        name: z.string().openapi({ description: 'Name of this limited.' }),
        id: z.string().openapi({ description: 'ID of this limited.' }),
        picture: z.url().openapi({ description: 'Picture of this item.' }),
        rap: z.number().openapi({ description: 'RAP of this item.' }),
        value: z.number().nullable().openapi({
            description: 'Value of this item. Can be null if Rolimons has not valued it.'
        })
    })
    .openapi('RobloxLimitedSchema');

/** `robloxLimitedSchema` type. */
export type RobloxLimitedSchema = z.infer<typeof robloxLimitedSchema>;
