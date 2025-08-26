import topgg from '@top-gg/sdk';
import { topggToken } from '../src/tokens';
import { rest } from '../src/discord-bot/rest';
import * as discord from 'discord.js';

const api = new topgg.Api(topggToken);

const me = (await rest.get(discord.Routes.currentApplication())) as any;
const guilds = me.approximate_guild_count ?? 0;

const response = await api.postStats({
    serverCount: guilds
});

console.log(response);
