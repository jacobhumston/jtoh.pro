/**
 * This script exposes methods for the Discord API.
 *
 * Authored by Jacob Humston
 */
import { API } from '@discordjs/core/http-only';
import { REST } from '@discordjs/rest';

import apiTokens from '@server/modules/tokens';

/** Discord REST. */
export const rest = new REST({ version: '10' }).setToken(apiTokens.discordInteractionsToken);

/** Discord API. */
export const api = new API(rest);
