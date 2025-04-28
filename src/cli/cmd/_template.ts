import type { Command } from '../types';
import logger from '../logger';

export default {
    name: 'name',
    description: 'description',
    args: [],
    execute: async (args: string[]) => {
        logger.info('Hello, world!', args);
    }
} as Command;
