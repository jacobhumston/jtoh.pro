import fs from 'node:fs';
import type { Command } from './types';

export function getCommands(): Command[] {
    const files = fs.readdirSync('./src/cli/cmd');
    return files.filter((file) => !file.startsWith('_')).map((file) => require(`./cmd/${file}`).default);
}
