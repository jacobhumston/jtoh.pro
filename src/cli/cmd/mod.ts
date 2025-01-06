import type { Command } from '../types';
import logger from '../logger';
import fs from 'node:fs';
import { createModListFile } from '../../files';
import { userIdToUser, usernameToUser } from '../../roblox';
import { robloxAdminUserId } from '../../tokens';

export default {
    name: 'mod',
    description: 'Add or remove a user from the moderator list.',
    args: [
        {
            name: 'action',
            description: 'The action to perform. Can be "add", "remove", or "list".',
            required: true,
            type: 'string'
        },
        {
            name: 'username',
            description: 'The Roblox username to add or remove. Not required when listing all moderators.',
            required: false,
            type: 'string'
        }
    ],
    execute: (args: string[]) => {
        const users: number[] = JSON.parse(fs.readFileSync(createModListFile(), 'utf-8'));
        const action = args[0];
        const username = args[1];
        const adminId = robloxAdminUserId;

        if (action === 'add') {
            if (!username) return logger.error('You must provide a username to mod.');

            usernameToUser(username)
                .then((user) => {
                    if (users.includes(user.id)) return logger.error('User is already blacklisted.');
                    if (user.id === adminId) return logger.error('You are already a mod silly.');
                    users.push(user.id);
                    fs.writeFileSync(createModListFile(), JSON.stringify(users));
                    logger.info(`Blacklisted user ${user.name} (${user.id}).`);
                })
                .catch((err) => {
                    logger.error(err.toString());
                });
        } else if (action === 'remove') {
            if (!username) return logger.error('You must specify a moderator to remove.');

            usernameToUser(username)
                .then((user) => {
                    if (!users.includes(user.id)) return logger.error('User is not a moderator.');
                    users.splice(users.indexOf(user.id), 1);
                    fs.writeFileSync(createModListFile(), JSON.stringify(users));
                    logger.info(`Removed user ${user.name} (${user.id}) from the mod list.`);
                })
                .catch((err) => {
                    logger.error(err.toString());
                });
        } else if (action === 'list') {
            logger.info(
                'Moderators:',
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
