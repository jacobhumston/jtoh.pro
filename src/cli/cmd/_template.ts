import type { Command } from '../types';
import logger from '../logger';

export default {
    name: 'name',
    description: 'description',
    args: [],
    execute: (args: string[]) => {
        logger.info('Hello, world!', args);
    }
} as Command;
