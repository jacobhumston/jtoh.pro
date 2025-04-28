import type { Context } from 'hono';
import { getConnInfo } from 'hono/bun';
import { isDev } from './dev';

/**
 * Get the IP address of the context.
 * @param context The context.
 * @returns The IP address.
 */
export function getIP(context: Context): string {
    return (isDev ? getConnInfo(context).remote.address : context.req.header('CF-Connecting-IP')) ?? 'NOIP';
}
