import type { Command } from '../types';
import logger from '../logger';
import fs from 'node:fs';
import { createLeadboardBlacklistFile } from '../../files';
import { userIdToUser, usernameToUser } from '../../roblox';
import { robloxAdminUserId } from '../../tokens';

export default {
    name: 'leaderboards-blacklist',
    description: 'Blacklist a user from the leaderboards.',
    args: [
        {
            name: 'action',
            description: 'The action to perform. Can be "add", "remove", or "list".',
            required: true,
            type: 'string'
        },
        {
            name: 'username',
            description: 'The Roblox username to blacklist or remove. Not required when listing all blacklisted users.',
            required: false,
            type: 'string'
        }
    ],
    execute: (args: string[]) => {
        const users: number[] = JSON.parse(fs.readFileSync(createLeadboardBlacklistFile(), 'utf-8'));
        const action = args[0];
        const username = args[1];
        const adminId = robloxAdminUserId;

        if (action === 'add') {
            if (!username) return logger.error('You must provide a username to blacklist.');

            usernameToUser(username)
                .then((user) => {
                    if (users.includes(user.id)) return logger.error('User is already blacklisted.');
                    if (user.id === adminId) return logger.error('You cannot blacklist the admin.');
                    users.push(user.id);
                    fs.writeFileSync(createLeadboardBlacklistFile(), JSON.stringify(users));
                    logger.info(`Blacklisted user ${user.name} (${user.id}).`);
                })
                .catch((err) => {
                    logger.error(err);
                });
        } else if (action === 'remove') {
            if (!username) return logger.error('You must provide a username to remove from the blacklist.');

            usernameToUser(username)
                .then((user) => {
                    if (!users.includes(user.id)) return logger.error('User is not blacklisted.');
                    users.splice(users.indexOf(user.id), 1);
                    fs.writeFileSync(createLeadboardBlacklistFile(), JSON.stringify(users));
                    logger.info(`Removed user ${user.name} (${user.id}) from the blacklist.`);
                })
                .catch((err) => {
                    logger.error(err);
                });
        } else if (action === 'list') {
            logger.info(
                'Blacklisted users:',
                users.forEach(async (userId) => {
                    const user = await userIdToUser(userId);
                    logger.info(`- ${user.name} (${user.id})`);
                })
            );
        } else {
            logger.error('Invalid action. Must be "add", "remove", or "list".');
        }
    }
} as Command;
