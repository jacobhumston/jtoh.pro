import { exec } from 'node:child_process';
import logger from './logger';

let report: any = null;
export function getLicenseReport() {
    if (report) return Promise.resolve(report);
    return new Promise((resolve, reject) => {
        exec(
            'bunx license-report --fields=name --fields=installedVersion --fields=licenseType --fields=author --fields=link ',
            (error, stdout) => {
                if (error) {
                    logger.error(`exec error: ${error}`);
                    reject(error);
                    return;
                }
                report = { updated: new Date(), packages: JSON.parse(stdout) };
                resolve(report);
            }
        );
    });
}
