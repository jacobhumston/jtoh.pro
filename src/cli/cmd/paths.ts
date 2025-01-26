import type { Command } from '../types';
import logger from '../logger';
import { getURL } from '../../dev';

export default {
    name: 'paths',
    description: 'Get the url paths of admin data routes.',
    args: [
        {
            name: 'include-all',
            description: 'Include all paths, not just admin paths.',
            required: false,
            type: 'boolean'
        }
    ],
    execute: async (args: string[], cookie) => {
        if (!cookie) {
            logger.error('No cookie provided.');
            return;
        }
        const includeAll = args[0] === 'true';
        logger.info('Getting paths...');
        const time = Date.now();
        const response = await fetch(getURL() + `/ext/admin/routes?authToken=${cookie}`);
        if (!response.ok) {
            logger.error(`Failed to fetch paths: ${response.status} ${response.statusText}`);
            return;
        }
        logger.info(`Paths fetched in ${Date.now() - time}ms`);
        const json = await response.json();
        json.routes.forEach((route: { method: string; path: string; handler: string }) => {
            if (!includeAll) if (!route.path.startsWith('/ext/admin') && !route.path.startsWith('/app/admin/')) return;
            logger.info(
                `[${route.method.toUpperCase()}] ${route.path} => ${route.handler.length > 0 ? route.handler : 'N/A'} (${getURL() + route.path})`
            );
        });
    }
} as Command;
