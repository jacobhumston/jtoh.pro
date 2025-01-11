import type { Command } from '../types';
import logger from '../logger';
import { getURL } from '../../dev';

export default {
    name: 'paths',
    description: 'Get the url paths of admin data routes.',
    args: [],
    execute: async (_, cookie) => {
        if (!cookie) {
            logger.error('No cookie provided.');
            return;
        }
        logger.info('Getting paths...');
        const time = Date.now();
        const response = await fetch(getURL() + '/ext/admin/routes', { headers: { Cookie: `auth-token=${cookie}` } });
        logger.info(`Paths fetched in ${Date.now() - time}ms`);
        const json = await response.json();
        json.routes.forEach((route: { method: string; path: string; handler: string }) => {
            if (
                (route.path.startsWith('/ext/admin') || route.path.startsWith('/app/admin/')) &&
                !route.path.includes('*')
            ) {
                logger.info(
                    `[${route.method.toUpperCase()}] ${route.path} => ${route.handler.length > 0 ? route.handler : 'N/A'} (${getURL() + route.path})`
                );
            }
        });
    }
} as Command;
