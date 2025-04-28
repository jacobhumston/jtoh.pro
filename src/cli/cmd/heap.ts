import type { Command } from '../types';
import logger from '../logger';
import { getURL } from '../../dev';

export default {
    name: 'create-heap',
    description: 'Create a heap snapshot.',
    args: [],
    execute: async (_, cookie) => {
        if (!cookie) {
            logger.error('No cookie provided.');
            return;
        }
        logger.info('Creating heap snapshot...');
        const response = await fetch(getURL() + `/api/admin/create-heap-snapshot?authToken=${cookie}`);
        if (!response.ok) {
            logger.error(`Failed to create a heap snapshot: ${response.status} ${response.statusText}`);
            return;
        }
        const json = await response.json();
        logger.info('Done! ' + json.url);
    }
} as Command;
