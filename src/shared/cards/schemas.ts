import { z } from 'zod';

const zWebUrlOptions = { protocol: /^https?$/, hostname: z.regexes.domain };

export const zUser = z.object({
    id: z.number(),
    username: z.string(),
    displayName: z.string(),
    isVerified: z.boolean(),
    avatarHeadshotUrl: z.url(zWebUrlOptions),
    backgroundImageUrl: z.url(zWebUrlOptions).optional()
});

export const zGame = z.object({
    name: z.string(),
    abbreviation: z.string().toLowerCase(),
    baseAccessUrl: z.url(zWebUrlOptions)
});
