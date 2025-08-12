import { z } from 'zod';

const colorRegex = /^#[0-9a-fA-F]{6}$/;
const colorRegexInvalidError = { error: 'Name color must be a valid hex color code (e.g., #ffffff)' };

const cardConfig = z.object({
    nameColor: z.string().regex(colorRegex, colorRegexInvalidError).default('#ffffff')
});

export class Card {}
