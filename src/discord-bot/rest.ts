import { REST } from '@discordjs/rest';
import { discordInteractionsToken } from '../tokens';

export const rest = new REST({ version: '10' }).setToken(discordInteractionsToken);
