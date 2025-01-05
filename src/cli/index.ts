import { terminal } from 'terminal-kit';
import { argv } from 'bun';
import process from 'node:process';
import logger from './logger';
import { getCommands } from './commands';

terminal.clear();

const parts = argv.splice(2);
const command = parts[0];

if (!command) {
    logger.error('No command provided! Use "help" for a list of commands.');
    process.exit(0);
}

const commands = getCommands();
const cmd = commands.find((c) => c.name === command);
if (cmd) {
    cmd.execute(parts.slice(1));
} else {
    logger.error(`Command "${command}" not found! Use "help" for a list of commands.`);
    process.exit(0);
}
