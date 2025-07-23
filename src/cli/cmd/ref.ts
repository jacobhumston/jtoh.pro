import type { Command } from '../types';
import logger from '../logger';
import { referralsDB } from '../../db';
import { usernameToUser } from '../../roblox';

export default {
    name: 'ref',
    description: 'Manage referral codes.',
    args: [
        {
            name: 'command',
            description: 'The command to execute. (list, add, add-viewer, delete)',
            required: true,
            type: 'string'
        },
        {
            name: 'code',
            description: 'The referral code to manage.',
            required: false,
            type: 'string'
        },
        {
            name: 'user',
            description: 'The user to manage for this code.',
            required: false,
            type: 'string'
        }
    ],
    execute: async (args: string[]) => {
        const command = args[0];
        const code = args[1] ? args[1].toLowerCase() : undefined;
        const user = args[2] ? await usernameToUser(args[2]) : undefined;

        if (command === 'list') {
            const codes = (await referralsDB.get('codes')) || [];
            logger.info('Referral Codes:');
            codes.forEach((c: string) => {
                logger.info(`- ${c}`);
            });
        } else if (command === 'add' && code) {
            const codes = (await referralsDB.get('codes')) || [];
            if (!codes.includes(code)) {
                codes.push(code);
                await referralsDB.set('codes', codes);
                logger.info(`Added referral code: ${code}`);
            } else {
                logger.warn(`Referral code ${code} already exists.`);
            }
        } else if (command === 'add-viewer' && code && user) {
            const codes = (await referralsDB.get('codes')) || [];
            if (codes.includes(code)) {
                const userViewable = (await referralsDB.get(`_${user.id}`)) || [];
                if (!userViewable.includes(code)) {
                    userViewable.push(code);
                    await referralsDB.set(`_${user.id}`, userViewable);
                    logger.info(`Added user ${user.name} to referral code ${code}`);
                } else {
                    logger.warn(`User ${user.name} already exists for referral code ${code}`);
                }
            } else {
                logger.error(`Referral code ${code} does not exist.`);
            }
        } else if (command === 'delete' && code) {
            const codes = (await referralsDB.get('codes')) || [];
            if (codes.includes(code)) {
                const index = codes.indexOf(code);
                codes.splice(index, 1);
                await referralsDB.set('codes', codes);
                logger.info(`Deleted referral code: ${code}`);
            } else {
                logger.warn(`Referral code ${code} does not exist.`);
            }
        } else {
            logger.error(`Unknown command (or missing args): ${command}`);
        }
    }
} as Command;
