/**
 * Simple utility module to get the IP from a request.
 *
 * Authored by Jacob Humston
 */
import type { Context } from 'hono';
import { getConnInfo } from 'hono/bun';

import { isDev } from '../config';
import { log } from './logger';

/**
 * Get the IP address of a request using the request context.
 * @param context The request context.
 * @returns The IP address.
 */
export function getIPFromContext(context: Context): string {
    const connectionInfo = getConnInfo(context);
    if (!connectionInfo.remote.address && !context.req.header('CF-Connecting-IP'))
        log('critical', `IP missing? ${JSON.stringify(context)}`);
    if (isDev) {
        return connectionInfo.remote.address ?? 'NOIP';
    } else {
        return context.req.header('CF-Connecting-IP') ?? connectionInfo.remote.address ?? 'NOIP';
    }
}
