/**
 * Update top.gg stats periodically.
 *
 * Authored by Jacob Humston
 */

import topgg from '@top-gg/sdk';

import { api } from '@discord/rest';
import { createTask } from '@server/managers/tasks';
import { logError } from '@server/modules/logger';
import apiTokens from '@server/modules/tokens';

const topggApi = new topgg.Api(apiTokens.topggToken);

/**
 * Start the top.gg task that updates the bot's stats.
 */
export function createTopggTask() {
    createTask('top.gg Stats', 'Updates top.gg stats.', { days: 1 }, async () => {
        const me = await api.applications.getCurrent().catch(() => ({ approximate_guild_count: undefined }));
        const guilds = me.approximate_guild_count ?? 0;
        if (guilds > 0) {
            topggApi.postStats({ serverCount: guilds }).catch(logError);
        }
    });
}
