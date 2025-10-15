/**
 * Captcha schemas.
 *
 * Authored by Jacob Humston
 */
import { z } from '@hono/zod-openapi';

/** Schema that represents a captcha. */
export const captchaSchema = z
    .object({
        algorithm: z.enum(['SHA-1', 'SHA-256', 'SHA-512']),
        challenge: z.string(),
        maxnumber: z.number().optional(),
        salt: z.string(),
        signature: z.string()
    })
    .openapi({ description: 'Captcha Schema' });

/** `captchaSchema` type. */
export type CaptchaSchema = z.infer<typeof captchaSchema>;
