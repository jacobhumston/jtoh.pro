import { z } from 'zod';

/** Card Schemas */
const cardSchemas = {
    user: z.object({
        id: z.number(),
        username: z.string()
    })
};

/** Card Schema User Type */
export type CardSchemasUser = z.infer<typeof cardSchemas.user>;

export default cardSchemas;
