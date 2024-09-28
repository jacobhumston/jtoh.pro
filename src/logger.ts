import winston from 'winston';
import fs from 'node:fs';
import { isDev } from './dev';

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

export default logger;
