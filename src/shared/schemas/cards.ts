/**
 * Schemes related to cards.
 *
 * Authored by Jacob Humston
 */
import { z } from '@hono/zod-openapi';

/** Card background schema. */
export const cardBackgroundSchema = z
    .object({
        id: z.string().openapi({ description: 'Identification string of this card background.' }),
        isCustom: z
            .boolean()
            .openapi({ description: 'If true, this card background is custom and was uploaded by a user.' }),
        url: z.url().openapi({ description: 'URL to access this card background.' }),
        category: z.string().openapi({
            description:
                'Category that this card background belongs to. This will always be "User Uploaded" when "isCustom" is true.'
        })
    })
    .openapi('CardBackgroundSchema');

/** `cardBackgroundSchema` type. */
export type CardBackgroundSchema = z.infer<typeof cardBackgroundSchema>;
