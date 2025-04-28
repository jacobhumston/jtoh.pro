import { terminal } from 'terminal-kit';
import { argv } from 'bun';
import process from 'node:process';
import logger from './logger';
import { getCommands } from './commands';

await import('../dev'); // Import the dev module to ensure the environment is set up before we modify environment variables.
// This was annoying to realize, your welcome future me. (Ofc im coding at 2am rn...)

terminal.clear();

let parts = argv.splice(2);
let partsRemoved = true;
let cookie: string | null = null;
while (partsRemoved) {
    partsRemoved = false;
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('--cookie')) {
            cookie = parts[i].split('=')[1];
            parts.splice(i, 1);
            partsRemoved = true;
            break;
        }
        if (parts[i].startsWith('--')) {
            parts.splice(i, 1);
            partsRemoved = true;
            break;
        }
    }
}
const command = parts[0];

if (!command) {
    logger.error('No command provided! Use "help" for a list of commands.');
    process.exit(0);
}

const commands = getCommands();
const cmd = commands.find((c) => c.name === command);
if (cmd) {
    await cmd.execute(parts.slice(1), cookie);
} else {
    logger.error(`Command "${command}" not found! Use "help" for a list of commands.`);
    process.exit(0);
}
