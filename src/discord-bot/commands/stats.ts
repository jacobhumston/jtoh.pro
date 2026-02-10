import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId, towerStatsToken } from '../../tokens';
import { fullNamesArray, gameNamesArray, type gameNames } from '../../shared/gamelist';
import { parseRobloxAccountV2 } from '../../login-auth';
import { autocompleteUserSelection, getFocusedOptionName } from '../autocomplete';
import { addRecent } from '../util';
import { towerstatsCache } from '../../cache';
import type { TowerDataCSCD, TowerDataEToH } from '../../type';
import { userIdToThumbnailFull } from '../../roblox';
import {
    updateSkillPoints,
    getPlaceInLeaderboard,
    skillPointsDB,
    getTotalInLeaderboard,
    updateTowerCount,
    towerCountDB
} from '../../db';

export const command = new discord.SlashCommandBuilder()
    .setName('stats')
    .setDescription('Get a stats for a specific user.')
    .setContexts([
        discord.InteractionContextType.BotDM,
        discord.InteractionContextType.PrivateChannel,
        discord.InteractionContextType.Guild
    ])
    .setIntegrationTypes([
        discord.ApplicationIntegrationType.GuildInstall,
        discord.ApplicationIntegrationType.UserInstall
    ]);

gameNamesArray.forEach((game, index) => {
    command.addSubcommand((subcommand) => {
        subcommand
            .setName(game)
            .setDescription(`Get stats for ${fullNamesArray[index]}.`)
            .addStringOption((option) =>
                option
                    .setName('user')
                    .setDescription('The user to get the stats for.')
                    .setRequired(true)
                    .setAutocomplete(true)
            );
        if (game === 'cscd')
            subcommand.addStringOption((option) =>
                option
                    .setName('mode')
                    .setDescription('The mode to get the stats for.')
                    .setRequired(true)
                    .setChoices([
                        { name: 'All Jumps', value: 'aj' },
                        { name: 'Legit', value: 'legit' }
                    ])
            );
        return subcommand;
    });
});

const emojis: Record<string, string> = {
    '1': '<:easy:1447440529196580944>',
    '2': '<:medium:1447440528156135667>',
    '3': '<:hard:1447440527258681395>',
    '4': '<:difficult:1447440526302253126>',
    '5': '<:challenging:1447440525065191525>',
    '6': '<:intense:1447440524243112067>',
    '7': '<:remorseless:1447440523043541042>',
    '8': '<:insane:1447440522120531978>',
    '9': '<:extreme:1447440520912830536>',
    '10': '<:terrifying:1447440519503544330>',
    '11': '<:catastrophic:1447440518459162695>',
    '12': '<:horrific:1447442337214103562>',
    '13': '<:unreal:1447442336387825664>',
    '14': '<:nil:1447442334785470514>'
};

const formatter = new Intl.NumberFormat('en-US');

export async function execute(interaction: discord.APIChatInputApplicationCommandInteraction) {
    const form = new FormData();

    if (!interaction.data.options) return;

    if (interaction.data.options[0].type !== discord.ApplicationCommandOptionType.Subcommand) return;
    if (interaction.data.options[0].options === undefined) return;

    const game = interaction.data.options[0].name;
    const username = interaction.data.options[0].options[0].value;

    const fullGameName = fullNamesArray[gameNamesArray.indexOf(game as gameNames)];

    const container = new discord.ContainerBuilder();
    const user = await parseRobloxAccountV2(username as string);

    if (user) {
        await addRecent(interaction, user.name);
        if (game === 'etoh') {
            const cached = towerstatsCache.get(`${user.id}-etoh`);
            let towerStats: TowerDataEToH | undefined =
                cached ??
                (await fetch(`https://api.towerstats.com/api/etoh`, {
                    method: 'POST',
                    body: JSON.stringify({ id: user.id }),
                    headers: {
                        apiKey: towerStatsToken
                    }
                })
                    .then((res) => {
                        if (res.ok) return res.json();
                        return undefined;
                    })
                    .catch(() => undefined));

            if (towerStats !== undefined && (towerStats.error as any) !== undefined) {
                towerStats = undefined;
            }

            if (towerStats !== undefined && cached === undefined) {
                towerstatsCache.set(`${user.id}-etoh`, towerStats);
            }

            const thumb = (await userIdToThumbnailFull(user.id).catch(() => null)) ?? '';

            if (towerStats === undefined) {
                container.addTextDisplayComponents((text) =>
                    text.setContent(`*Failed to load ${user.name}'s stats for ${fullGameName}*`)
                );
            } else {
                await updateSkillPoints('etoh', user, towerStats.skill_points).catch(() => undefined);
                await updateTowerCount('etoh', user, towerStats.completed_towers).catch(() => undefined);

                container.addSectionComponents((section) => {
                    section.addTextDisplayComponents((text) =>
                        text.setContent(`### ${user.name}'s stats for ${fullGameName}`)
                    );
                    section.addTextDisplayComponents((text) =>
                        text.setContent(`Hardest Completion: ${emojis[Math.floor(towerStats.hardest_raw_difficulty).toString()] ?? ''} **${towerStats.hardest_tower ?? 'None'}**
Total Progress: **${towerStats.completed_towers} / ${towerStats.total_towers}** (${Math.floor((towerStats.completed_towers / towerStats.total_towers) * 100)}%)
Completed Areas: ${towerStats.completed_areas.length > 0 ? towerStats.completed_areas.map((a) => `**${a}**`).join(', ') : '**None**'}`)
                    );
                    return section.setThumbnailAccessory((thumbnail) => thumbnail.setURL(thumb));
                });

                container.addSeparatorComponents((sep) => sep.setSpacing(discord.SeparatorSpacingSize.Small));

                container.addTextDisplayComponents((text) => {
                    let string = `Difficulty Progress:`;
                    const difficultyOrder = [];
                    for (const [key, string] of Object.entries(towerStats.difficulties)) {
                        difficultyOrder[parseInt(key) - 1] = string;
                    }
                    for (const [index, value] of difficultyOrder.entries()) {
                        if (towerStats.difficulty_progress[value] === undefined) continue;
                        const emoji = emojis[(index + 1).toString()];
                        const progress = towerStats.difficulty_progress[value];
                        string = `${string}\n* ${emoji} ${towerStats.difficulties[(index + 1).toString()]}: **${progress[0]} / ${progress[1]}** (${Math.floor((progress[0] / progress[1]) * 100)}%)`;
                    }
                    return text.setContent(string);
                });

                container.addSeparatorComponents((sep) => sep.setSpacing(discord.SeparatorSpacingSize.Small));

                const spRank = ((value: number | null) => {
                    if (value === null) return 'N/A';
                    return `#${formatter.format(value)}`;
                })(await getPlaceInLeaderboard(skillPointsDB, 'etoh', user).catch(() => null));
                const spTotal = `out of ${formatter.format(await getTotalInLeaderboard(skillPointsDB, 'etoh'))}`;

                const completedTowersRank = ((value: number | null) => {
                    if (value === null) return 'N/A';
                    return `#${formatter.format(value)}`;
                })(await getPlaceInLeaderboard(towerCountDB, 'etoh', user).catch(() => null));
                const completedTowerTotal = `out of ${formatter.format(await getTotalInLeaderboard(towerCountDB, 'etoh'))}`;

                container.addTextDisplayComponents((text) => {
                    let msg = `Skill Points: **${formatter.format(towerStats.skill_points)}**`;
                    msg = msg + `\nSkill Points Leaderboard: **${spRank}** ${spTotal}`;
                    msg = msg + `\nCompleted Towers Leaderboard: **${completedTowersRank}** ${completedTowerTotal}`;
                    return text.setContent(msg);
                });
            }
        } else if (game === 'cscd') {
            const mode = interaction.data.options[0].options[1].value as 'aj' | 'legit';

            const cached = towerstatsCache.get(`${user.id}-cscd`);
            let towerStats: TowerDataCSCD | undefined =
                cached ??
                (await fetch(`https://api.towerstats.com/api/cscd`, {
                    method: 'POST',
                    body: JSON.stringify({ id: user.id }),
                    headers: {
                        apiKey: towerStatsToken
                    }
                })
                    .then((res) => {
                        if (res.ok) return res.json();
                        return undefined;
                    })
                    .catch(() => undefined));

            if (towerStats !== undefined && (towerStats.error as any) !== undefined) {
                towerStats = undefined;
            }

            if (towerStats !== undefined && cached === undefined) {
                towerstatsCache.set(`${user.id}-cscd`, towerStats);
            }

            const thumb = (await userIdToThumbnailFull(user.id).catch(() => null)) ?? '';

            if (towerStats === undefined) {
                container.addTextDisplayComponents((text) =>
                    text.setContent(`*Failed to load ${user.name}'s stats for ${fullGameName}*`)
                );
            } else {
                await updateSkillPoints('cscd', user, towerStats.skill_points.legit).catch(() => undefined);
                await updateTowerCount('cscd', user, towerStats.completed_towers.legit).catch(() => undefined);

                container.addSectionComponents((section) => {
                    section.addTextDisplayComponents((text) =>
                        text.setContent(`### ${user.name}'s stats for ${fullGameName}`)
                    );
                    section.addTextDisplayComponents((text) =>
                        text.setContent(`Mode: **${mode === 'aj' ? 'All Jumps' : 'Legit'}**
Hardest Completion: ${emojis[Math.floor(towerStats.hardest_raw_difficulty[mode]).toString()] ?? ''} **${towerStats.hardest_tower[mode] ?? 'None'}**
Total Progress: **${towerStats.completed_towers[mode]} / ${towerStats.total_towers}** (${Math.floor((towerStats.completed_towers[mode] / towerStats.total_towers) * 100)}%)
Completed Areas: ${towerStats.completed_areas.length > 0 ? towerStats.completed_areas.map((a) => `**${a}**`).join(', ') : '**None**'}`)
                    );
                    return section.setThumbnailAccessory((thumbnail) => thumbnail.setURL(thumb));
                });

                container.addSeparatorComponents((sep) => sep.setSpacing(discord.SeparatorSpacingSize.Small));

                container.addTextDisplayComponents((text) => {
                    let string = `Difficulty Progress:`;
                    const difficultyOrder = [];
                    for (const [key, string] of Object.entries(towerStats.difficulties)) {
                        difficultyOrder[parseInt(key) - 1] = string;
                    }
                    for (const [index, value] of difficultyOrder.entries()) {
                        if (towerStats.difficulty_progress[mode][value] === undefined) continue;
                        const emoji = emojis[(index + 1).toString()];
                        const progress = towerStats.difficulty_progress[mode][value];
                        string = `${string}\n* ${emoji} ${towerStats.difficulties[(index + 1).toString()]}: **${progress[0]} / ${progress[1]}** (${Math.floor((progress[0] / progress[1]) * 100)}%)`;
                    }
                    return text.setContent(string);
                });

                container.addSeparatorComponents((sep) => sep.setSpacing(discord.SeparatorSpacingSize.Small));

                const spRank = ((value: number | null) => {
                    if (value === null) return 'N/A';
                    return `#${formatter.format(value)}`;
                })(await getPlaceInLeaderboard(skillPointsDB, 'cscd', user).catch(() => null));
                const spTotal = `out of ${formatter.format(await getTotalInLeaderboard(skillPointsDB, 'cscd'))}`;

                const completedTowersRank = ((value: number | null) => {
                    if (value === null) return 'N/A';
                    return `#${formatter.format(value)}`;
                })(await getPlaceInLeaderboard(towerCountDB, 'cscd', user).catch(() => null));
                const completedTowerTotal = `out of ${formatter.format(await getTotalInLeaderboard(towerCountDB, 'cscd'))}`;

                container.addTextDisplayComponents((text) => {
                    let msg = `Skill Points: **${formatter.format(towerStats.skill_points.legit)}**`;
                    msg = msg + `\nSkill Points Leaderboard: **${spRank}** ${spTotal}`;
                    msg = msg + `\nCompleted Towers Leaderboard: **${completedTowersRank}** ${completedTowerTotal}`;
                    return text.setContent(msg);
                });
            }
        } else if (game === 'tea') {
            const cached = towerstatsCache.get(`${user.id}-tea`);
            let towerStats: TowerDataEToH | undefined =
                cached ??
                (await fetch(`https://api.towerstats.com/api/tea`, {
                    method: 'POST',
                    body: JSON.stringify({ id: user.id }),
                    headers: {
                        apiKey: towerStatsToken
                    }
                })
                    .then((res) => {
                        if (res.ok) return res.json();
                        return undefined;
                    })
                    .catch(() => undefined));

            if (towerStats !== undefined && (towerStats.error as any) !== undefined) {
                towerStats = undefined;
            }

            if (towerStats !== undefined && cached === undefined) {
                towerstatsCache.set(`${user.id}-tea`, towerStats);
            }

            const thumb = (await userIdToThumbnailFull(user.id).catch(() => null)) ?? '';

            if (towerStats === undefined) {
                container.addTextDisplayComponents((text) =>
                    text.setContent(`*Failed to load ${user.name}'s stats for ${fullGameName}*`)
                );
            } else {
                await updateSkillPoints('tea', user, towerStats.skill_points).catch(() => undefined);
                await updateTowerCount('tea', user, towerStats.completed_towers).catch(() => undefined);

                container.addSectionComponents((section) => {
                    section.addTextDisplayComponents((text) =>
                        text.setContent(`### ${user.name}'s stats for ${fullGameName}`)
                    );
                    section.addTextDisplayComponents((text) =>
                        text.setContent(`Hardest Completion: ${emojis[Math.floor(towerStats.hardest_raw_difficulty).toString()] ?? ''} **${towerStats.hardest_tower ?? 'None'}**
Total Progress: **${towerStats.completed_towers} / ${towerStats.total_towers}** (${Math.floor((towerStats.completed_towers / towerStats.total_towers) * 100)}%)
Completed Areas: ${towerStats.completed_areas.length > 0 ? towerStats.completed_areas.map((a) => `**${a}**`).join(', ') : '**None**'}`)
                    );
                    return section.setThumbnailAccessory((thumbnail) => thumbnail.setURL(thumb));
                });

                container.addSeparatorComponents((sep) => sep.setSpacing(discord.SeparatorSpacingSize.Small));

                container.addTextDisplayComponents((text) => {
                    let string = `Difficulty Progress:`;
                    const difficultyOrder = [];
                    for (const [key, string] of Object.entries(towerStats.difficulties)) {
                        difficultyOrder[parseInt(key) - 1] = string;
                    }
                    for (const [index, value] of difficultyOrder.entries()) {
                        if (towerStats.difficulty_progress[value] === undefined) continue;
                        const emoji = emojis[(index + 1).toString()];
                        const progress = towerStats.difficulty_progress[value];
                        string = `${string}\n* ${emoji} ${towerStats.difficulties[(index + 1).toString()]}: **${progress[0]} / ${progress[1]}** (${Math.floor((progress[0] / progress[1]) * 100)}%)`;
                    }
                    return text.setContent(string);
                });

                container.addSeparatorComponents((sep) => sep.setSpacing(discord.SeparatorSpacingSize.Small));

                const spRank = ((value: number | null) => {
                    if (value === null) return 'N/A';
                    return `#${formatter.format(value)}`;
                })(await getPlaceInLeaderboard(skillPointsDB, 'tea', user).catch(() => null));
                const spTotal = `out of ${formatter.format(await getTotalInLeaderboard(skillPointsDB, 'tea'))}`;

                const completedTowersRank = ((value: number | null) => {
                    if (value === null) return 'N/A';
                    return `#${formatter.format(value)}`;
                })(await getPlaceInLeaderboard(towerCountDB, 'tea', user).catch(() => null));
                const completedTowerTotal = `out of ${formatter.format(await getTotalInLeaderboard(towerCountDB, 'tea'))}`;

                container.addTextDisplayComponents((text) => {
                    let msg = `Skill Points: **${formatter.format(towerStats.skill_points)}**`;
                    msg = msg + `\nSkill Points Leaderboard: **${spRank}** ${spTotal}`;
                    msg = msg + `\nCompleted Towers Leaderboard: **${completedTowersRank}** ${completedTowerTotal}`;
                    return text.setContent(msg);
                });
            }
        }
    } else {
        container.addTextDisplayComponents((text) => {
            text.setContent(`**The user you requested does not exist.** Please try again.

Available User Options: 
- \`{Roblox Username}\`
- \`!{Roblox User ID}\`
-# *(Do not include the brackets.)*
                `);
            return text;
        });

        container.addActionRowComponents((row) =>
            row.addComponents(
                new discord.ButtonBuilder()
                    .setStyle(discord.ButtonStyle.Link)
                    .setLabel('Need Help?')
                    .setURL(`https://discord.jtoh.pro`)
            )
        );
    }

    const payload: discord.RESTPostAPIInteractionFollowupJSONBody = {
        components: [container.toJSON()],
        flags: discord.MessageFlags.IsComponentsV2
    };
    form.set('payload_json', JSON.stringify(payload));

    await rest
        .patch(discord.Routes.webhookMessage(discordInteractionsApplicationId, interaction.token, '@original'), {
            body: form,
            passThroughBody: true
        })
        .catch(console.log);
}

export async function autocomplete(
    interaction: discord.APIApplicationCommandAutocompleteInteraction
): Promise<discord.APICommandAutocompleteInteractionResponseCallbackData> {
    const focusedOptionName = getFocusedOptionName(interaction);
    if (focusedOptionName !== 'user') return { choices: [] };
    return await autocompleteUserSelection(interaction);
}
