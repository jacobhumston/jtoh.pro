import type { Command } from '../types';
import logger from '../logger';
import { getCommands } from '../commands';

export default {
    name: 'help',
    description: 'Prints a helpful message.',
    args: [],
    execute: async () => {
        const commands = await getCommands();
        logger.info('Welcome to the jtoh.pro CLI!');
        logger.info('Available commands:');
        commands.forEach((cmd) => {
            logger.info(`\t${cmd.name}`);
            logger.info(`\t| ${cmd.description}`);
            if (cmd.args.length > 0) logger.info('\t| Arguments:');
            cmd.args.forEach((arg, index) => {
                logger.info(`\t|    [${index}] ${arg.name} (${arg.type}) [${arg.required ? 'Required' : 'Optional'}]`);
                logger.info(`\t|    -${'-'.repeat(`${index}`.length)}- ${arg.description}`);
            });
            logger.info('');
        });
    }
} as Command;
