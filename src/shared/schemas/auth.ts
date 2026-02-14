/**
 * Auth related schemas.
 *
 * Authored by Jacob Humston
 */
import { z } from '@hono/zod-openapi';

/** Schema that represents auth info. */
export const authInfoSchema = z
    .object({
        roblox: z
            .object({
                id: z.number().openapi({ description: 'The Roblox ID of this user.' }),
                username: z.string().openapi({ description: "This user's Roblox username." }),
                displayName: z.string().openapi({ description: 'The display name of this user.' }),
                picture: z.url().openapi({ description: "The url to this user's profile picture/avatar headshot." }),
                expires: z.iso.datetime().openapi({ description: 'The date that this authentication expires.' })
            })
            .nullable()
            .openapi({ description: 'Roblox authentication data.' })
    })
    .openapi('AuthInfoSchema');

/** `authInfoSchema` type. */
export type AuthInfoSchema = z.infer<typeof authInfoSchema>;
