import winston from 'winston';
import fs from 'node:fs';
import { isDev } from './dev';
import { convertTo } from '@jacobhumston/tc.js';
import proccess from 'node:process';

if (!fs.existsSync('logs/')) fs.mkdirSync('logs/');
if (!fs.existsSync('logs/current/')) fs.mkdirSync('logs/current/');
if (!fs.existsSync('logs/old/')) fs.mkdirSync('logs/old/');

for (const file of fs.readdirSync('logs/current/')) {
    fs.renameSync(`logs/current/${file}`, `logs/old/${file}`);
}

const date = new Date();

const logFolderName = `logs/current/${date.toISOString().replaceAll(':', '_').replaceAll('.', '__')}/`;
fs.mkdirSync(logFolderName);
fs.writeFileSync(`${logFolderName}created.txt`, `${date.toDateString()} ${date.toTimeString()}`);

let removedLogFolders = 0;
for (const folder of fs.readdirSync('logs/old/')) {
    const age = new Date(folder.replaceAll('__', '.').replaceAll('_', ':')).getTime();
    if (Date.now() - age > convertTo({ days: 1 }, 'milliseconds')) {
        fs.rmSync(`logs/old/${folder}`, { recursive: true, force: true });
        removedLogFolders++;
    }
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ filename: `${logFolderName}error.log`, level: 'error' }),
        new winston.transports.File({ filename: `${logFolderName}general.log` })
    ]
});

if (isDev) {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple())
        })
    );
}

logger.info(`Logger initialized. (${removedLogFolders} removed outdated log folders.)`);

proccess.on('uncaughtException', logger.error);

export default logger;
