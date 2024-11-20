import { Hono } from 'hono';
import tweetnacl from 'tweetnacl';
import { discordInteractionsApplicationId, discordInteractionsPublicKey, discordInteractionsToken } from './tokens';
import { v4 } from 'uuid';
import fs from 'node:fs';
import logger from './logger';
import { getURL, getURLHost, getURLWithSlash } from './dev';
import { getTempToken } from './temptokens';

export const discordAPIURL = 'https://discord.com/api/v10';
export const commands = [
    {
        name: 'jtoh',
        description: "Juke's Towers of Hell related commands.",
        options: [
            {
                name: 'card',
                description: 'Get a JToH card.',
                type: 1,
                options: [
                    {
                        name: 'username',
                        description: 'The Roblox username of the player.',
                        type: 3,
                        required: true,
                        min_length: 3,
                        max_length: 20
                    }
                ]
            },
            {
                name: 'embed',
                description: 'Get a JToH embed.',
                type: 1,
                options: [
                    {
                        name: 'username',
                        description: 'The Roblox username of the player.',
                        type: 3,
                        required: true,
                        min_length: 3,
                        max_length: 20
                    }
                ]
            }
        ],
        contexts: [0, 1, 2],
        integration_types: [0, 1]
    }
];

export async function publishDiscordCommands() {
    const commandString = JSON.stringify(commands);
    const commandHash = getURL() + '\n' + btoa(commandString);
    if (!fs.existsSync('cache/')) fs.mkdirSync('cache/');
    if (!fs.existsSync('cache/discord-commands')) fs.writeFileSync('cache/discord-commands', '');

    const cache = fs.readFileSync('cache/discord-commands', 'utf-8');
    if (cache === commandHash) {
        logger.info('Discord commands are already up to date.');
        return;
    }

    logger.info('Publishing Discord commands...');
    fs.writeFileSync('cache/discord-commands', commandHash);

    const appId = discordInteractionsApplicationId;
    const url = `${discordAPIURL}/applications/${appId}/commands`;
    return fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bot ${discordInteractionsToken}`,
            'Content-Type': 'application/json'
        },
        body: commandString
    });
}

export default function discordInteractions(app: Hono) {
    app.post('/ext/discord-interactions', async (context) => {
        const signature = context.req.header('X-Signature-Ed25519') ?? '';
        const timestamp = context.req.header('X-Signature-Timestamp') ?? '';
        let body = await context.req.text();

        if (!signature || !timestamp || !body) {
            return context.json({ error: 'Invalid request.' }, 400);
        }

        const isVerified = tweetnacl.sign.detached.verify(
            // @ts-ignore
            Buffer.from(timestamp + body),
            Buffer.from(signature, 'hex'),
            Buffer.from(discordInteractionsPublicKey, 'hex')
        );

        if (!isVerified) {
            return context.json({ error: 'Invalid request.' }, 400);
        }

        const data = JSON.parse(body);
        if (data.type === 1) {
            return context.json({ type: 1 });
        } else if (data.type === 2) {
            if (data.data.name === 'jtoh') {
                const command = data.data.options[0];
                let url = getURLWithSlash();
                let username = command.options[0].value;
                if (command.name === 'card') {
                    url += username;
                } else if (command.name === 'embed') {
                    url += `embed/${username}`;
                }

                username = encodeURIComponent(username);

                if (!url.includes('?')) {
                    url += `?nocache=${v4().split('-')[0]}`;
                } else {
                    url += `&nocache=${v4().split('-')[0]}`;
                }

                const buttons = [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 5,
                                label: 'Open in Browser',
                                url: url
                            },
                            {
                                type: 2,
                                style: 5,
                                label: getURLHost(),
                                url: getURL()
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 5,
                                label: 'View towerstats.com Profile',
                                url: `${getURL()}/towerstats/jtoh/${username}`
                            }
                        ]
                    }
                ];

                if (command.name === 'embed') {
                    return context.json({
                        type: 4,
                        data: {
                            content: url,
                            components: buttons
                        }
                    });
                } else {
                    new Promise(async () => {
                        const image = await fetch(url + `&rlb-token=${getTempToken('rlb-token')}`);
                        const file = new File([await image.blob()], 'card.png', { type: 'image/png' });
                        const formData = new FormData();
                        formData.append(
                            'payload_json',
                            JSON.stringify({
                                components: buttons,
                                attachments: [
                                    {
                                        id: 0,
                                        filename: 'card.png'
                                    }
                                ]
                            })
                        );
                        formData.append('files[0]', file, 'card.png');
                        await fetch(
                            `${discordAPIURL}/webhooks/${discordInteractionsApplicationId}/${data.token}/messages/@original`,
                            {
                                body: formData,
                                headers: {
                                    Authorization: `Bot ${discordInteractionsToken}`
                                },
                                method: 'PATCH'
                            }
                        ).catch(logger.error);
                    });
                    return context.json({
                        type: 5
                    });
                }
            } else {
                return context.json({ error: 'Invalid command.' }, 400);
            }
        } else {
            return context.json({ error: 'Invalid request.' }, 400);
        }
    });
}
