import type { Context } from 'hono';
import { getConnInfo } from 'hono/bun';
import { getURLHost, isDev } from './dev';

/**
 * Get the IP address of the context.
 * @param context The context.
 * @returns The IP address.
 */
export function getIP(context: Context): string {
    return (
        (isDev
            ? getURLHost() !== 'dev.jtoh.pro'
                ? getConnInfo(context).remote.address
                : (context.req.header('CF-Connecting-IP') ?? 'NOIP')
            : context.req.header('CF-Connecting-IP')) ?? 'NOIP'
    );
}
