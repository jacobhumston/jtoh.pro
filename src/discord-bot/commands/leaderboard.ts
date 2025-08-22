import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { fullNamesArray, gameNamesArray, type gameNames } from '../../shared/gamelist';
import { getURL } from '../../dev';
import { getOrderedDB, skillPointsDB, towerCountDB } from '../../db';
import { parseRobloxAccountV2, parseRobloxAccountV2WithCache } from '../../login-auth';
import { autocompleteUserSelection, getFocusedOptionName } from '../autocomplete';
import { addRecent } from '../util';
import { getRobloxFriendsWithCache } from '../../roblox';

export const command = new discord.SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Get the top 100 users on a leaderboard.')
    .setContexts([
        discord.InteractionContextType.BotDM,
        discord.InteractionContextType.PrivateChannel,
        discord.InteractionContextType.Guild
    ])
    .setIntegrationTypes([
        discord.ApplicationIntegrationType.GuildInstall,
        discord.ApplicationIntegrationType.UserInstall
    ]);

const leaderboards = [
    {
        name: 'skill-points',
        display: 'Skill Points',
        db: skillPointsDB
    },
    {
        name: 'completed-towers',
        display: 'Completed Towers',
        db: towerCountDB
    }
];

leaderboards.forEach((leaderboard) => {
    command.addSubcommand((subcommand) => {
        subcommand
            .setName(leaderboard.name)
            .setDescription(`View the top 100 users on the ${leaderboard.display} leaderboard.`)
            .addStringOption((option) =>
                option
                    .setName('game')
                    .setDescription('The game to get the leaderboard for.')
                    .addChoices(
                        gameNamesArray.map((game, index) => ({
                            name: fullNamesArray[index],
                            value: game
                        }))
                    )
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('find')
                    .setDescription("Find a user's rank on the leaderboard.")
                    .setRequired(false)
                    .setAutocomplete(true)
            )
            .addStringOption((option) =>
                option
                    .setName('friends-of')
                    .setDescription("View the leaderboard with only this user's friends.")
                    .setRequired(false)
                    .setAutocomplete(true)
            );
        return subcommand;
    });
});

export async function execute(interaction: discord.APIChatInputApplicationCommandInteraction) {
    const form = new FormData();

    if (!interaction.data.options) return;
    if (interaction.data.options[0].type !== discord.ApplicationCommandOptionType.Subcommand) return;
    if (interaction.data.options[0].options === undefined) return;

    // @ts-ignore
    const leaderboard: { name: string; display: string; db: typeof skillPointsDB } = leaderboards.find(
        // @ts-ignore
        (l) => l.name === interaction.data.options[0].name
    );
    const game = interaction.data.options[0].options[0].value as gameNames;

    const fullGameName = fullNamesArray[gameNamesArray.indexOf(game as gameNames)];

    const container = new discord.ContainerBuilder();
    let leaderboardData = await getOrderedDB(leaderboard?.db, game).catch(() => []);
    let page = 1;
    let find = null;

    const friendsOfOption = interaction.data.options[0].options.find((option) => option.name === 'friends-of');
    const findOption = interaction.data.options[0].options.find((option) => option.name === 'find');

    const lastRank = leaderboardData[leaderboardData.length - 1].rank + 1;
    let friendLeaderboardName: string | null = null;
    if (friendsOfOption) {
        const mainUser = await parseRobloxAccountV2WithCache(friendsOfOption.value as string);
        if (mainUser) {
            friendLeaderboardName = mainUser.name;
            const friends = await getRobloxFriendsWithCache(mainUser.id);
            if (!friends) return null;
            leaderboardData = leaderboardData.filter(
                (item) => friends.find((user) => user.id === item.user.id) !== undefined || item.user.id === mainUser.id
            );
            for (const friend of friends) {
                if (leaderboardData.find((user) => user.user.id === friend.id) === undefined && friend.name !== '') {
                    // @ts-expect-error
                    friend.thumbnail = '';
                    // @ts-expect-error
                    leaderboardData.push({ rank: lastRank, user: friend, count: 0 });
                }
            }
        }
    }

    if (findOption) {
        const username = findOption.value as string;
        const user = await parseRobloxAccountV2(username).catch(() => null);
        if (user) {
            await addRecent(interaction, user.name);
            const index = leaderboardData.findIndex((data) => data.user.id === user.id);
            if (index !== -1) {
                find = leaderboardData[index].user.id;
                page = Math.floor(index / 100) + 1;
            } else {
                container.addTextDisplayComponents((text) =>
                    text.setContent(`-# **(find)** ${user.name} is not on the leaderboard.`)
                );
            }
        } else {
            container.addTextDisplayComponents((text) =>
                text.setContent(`-# **(find)** Invalid username, please try again.`)
            );
        }
    }

    if (leaderboardData.length === 0) {
        container.addTextDisplayComponents((text) =>
            text.setContent(
                `-# **(empty)** No users found on the ${leaderboard.display} leaderboard for ${fullGameName}.`
            )
        );
        form.set(
            'payload_json',
            JSON.stringify({ components: [container.toJSON()], flags: discord.MessageFlags.IsComponentsV2 })
        );
        await rest
            .patch(discord.Routes.webhookMessage(discordInteractionsApplicationId, interaction.token, '@original'), {
                body: form,
                passThroughBody: true
            })
            .catch(console.log);
        return;
    }

    const format = new Intl.NumberFormat();
    const data = leaderboardData.slice((page - 1) * 100, (page - 1) * 100 + 100);

    container.addTextDisplayComponents((text) =>
        text.setContent(
            `**${leaderboard?.display} ${friendLeaderboardName ? 'Friends ' : ''}Leaderboard ${friendLeaderboardName ? `of ${friendLeaderboardName} ` : ''}for ${fullGameName}**\n-# ${page === 1 ? 'Top 100' : `${format.format(data[0].rank)}-${format.format(data[data.length - 1].rank)} placed`} users as of <t:${Math.floor(Date.now() / 1000)}:f>.`
        )
    );

    container.addTextDisplayComponents((text) =>
        text.setContent(
            data
                .map(
                    (value) =>
                        `${find === value.user.id ? '\n' : ''}**${format.format(value.rank)})** ${value.user.name} — ${format.format(value.count)}${find === value.user.id ? '\n-# The requested user is shown above!\n' : ''}`
                )
                .join('\n') +
                (data.length === 100 ? `\n-# And **${leaderboardData.length - page * 100}** other users...` : '')
        )
    );

    container.addActionRowComponents((row) =>
        row.addComponents(
            new discord.ButtonBuilder()
                .setLabel('View Leaderboard')
                .setStyle(discord.ButtonStyle.Link)
                .setURL(`${getURL()}/app/leaderboards?type=${leaderboard?.name}&other=${game}&page=${page}`)
        )
    );

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
    if (focusedOptionName !== 'user' && focusedOptionName !== 'find' && focusedOptionName !== 'friends-of')
        return { choices: [] };
    return await autocompleteUserSelection(interaction);
}
