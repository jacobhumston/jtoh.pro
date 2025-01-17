import type { Command } from '../types';
import logger from '../logger';
import fs from 'node:fs';
import { terminal } from 'terminal-kit';

export default {
    name: 'logs',
    description: 'View log files.',
    args: [],
    execute: async () => {
        const convertFileName = (name: string) => name.replaceAll('__', '.').replaceAll('_', ':');
        const sortFiles = (a: string, b: string) =>
            new Date(convertFileName(a)).getTime() - new Date(convertFileName(b)).getTime();
        const current = fs.readdirSync('logs/current/')[0];
        const files = fs.readdirSync('logs/old/').concat(fs.readdirSync('logs/current/')).sort(sortFiles);

        logger.info(`Found ${files.length} log folders.`);
        if (files.length === 0) return;

        const choice = await terminal.singleColumnMenu(
            files.map((value, index) => `${index}: ${new Date(convertFileName(value)).toLocaleString()}`)
        ).promise;
        terminal.clear();
        terminal.grabInput(false);

        const folderName = files[parseInt(choice.selectedText.split(':')[0])];
        const folderPath = `logs/${current === folderName ? 'current/' : 'old/'}${folderName}/`;
        const folder = fs.readdirSync(folderPath);
        logger.info(`Reading log folder ${choice.selectedText.split(': ')[1]} (${folderPath})`);

        const newFilesChoice = await terminal.singleColumnMenu(folder).promise;
        const filePath = `logs/${current === folderName ? 'current/' : 'old/'}${folderName}/${newFilesChoice.selectedText}`;
        const file = fs.readFileSync(filePath, 'utf-8');
        terminal.clear();
        terminal.grabInput(false);
        logger.info(`Reading log file ${newFilesChoice.selectedText} (${filePath})`);
        logger.info(`[START]---------------------------------------------`);
        console.log();
        console.log(file);
        console.log();
        logger.info(`[END--]---------------------------------------------`);
    }
} as Command;
