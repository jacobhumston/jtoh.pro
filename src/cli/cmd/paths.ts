import type { Command } from '../types';
import logger from '../logger';

export default {
    name: 'paths',
    description: 'Get the url paths of admin data routes.',
    args: [],
    execute: () => {
        logger.info('Paths:');
        logger.info('| ROUTES -> /ext/admin/routes');
    }
} as Command;
