/**
 * A simple logger used for debugging, etc.
 * Not to be confused with 'managers/logs' which serves
 * a different purpose.
 *
 * Authored by Jacob Humston
 */
import { convertTo } from '@jacobhumston/tc.js';

import { createWriteStream, readdirSync, rmSync, symlinkSync } from 'node:fs';
import process from 'node:process';

import { safelyGetPath } from '../managers/files';

// create log file
const logsFolder = safelyGetPath('logs');
const logFileName = `${logsFolder}/${new Date().toISOString()}.log`;
const logFile = createWriteStream(logFileName, { flags: 'w' });

// create a symlink for convenience
rmSync(`${logsFolder}/../current-log.log`, { force: true });
symlinkSync(logFileName, `${logsFolder}/../current-log.log`);

/**
 * Delete logs that are older then three hours.
 */
export function cleanUpLogs() {
    for (const file of readdirSync(logsFolder)) {
        const date = new Date(file.split('.log')[0]);
        const now = new Date();
        if ((now.getTime() - date.getTime()) / convertTo({ hours: 1 }, 'milliseconds') > 3)
            rmSync(`${logsFolder}/${file}`);
    }
}

/** Available log types. */
export type LogType = 'info' | 'warn' | 'error' | 'success' | 'debug' | 'critical';

/**
 * Log something.
 */
export function log(type: LogType, message: any) {
    console.log(`[${type.toUpperCase()}]:`, message);
    logFile.write(
        `${type.toUpperCase()}${' '.repeat('critical'.length - type.length)} |${' '.repeat(4)}${Bun.inspect(message).replaceAll('\n', `\n${' '.repeat('critical'.length)} |${' '.repeat(4)}`)}\n`,
        'utf8'
    );
}

/**
 * Gracefully close the log file and wait for all writes to complete.
 */
function closeLogFile(): Promise<void> {
    return new Promise((resolve, reject) => {
        logFile.end((error: any) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Handle process shutdown.
 * @param error Passed event/error.
 */
async function handleShutdown(error: any) {
    if (error) log('critical', error);

    try {
        await closeLogFile();
    } catch (error) {
        console.error('Failed to close log file:', error);
    }

    process.exit(1);
}

// handle exception events
process.on('uncaughtException', handleShutdown);
process.on('unhandledRejection', handleShutdown);
