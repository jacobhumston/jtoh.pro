import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { fullNamesArray, gameNamesArray, type gameNames } from '../../shared/gamelist';
import { getURL } from '../../dev';
import { getOrderedDB, skillPointsDB, towerCountDB } from '../../db';
import { parseRobloxAccountV2 } from '../../login-auth';

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
                option.setName('find').setDescription("Find a user's rank on the leaderboard.").setRequired(false)
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
    const leaderboard: any = leaderboards.find((l) => l.name === interaction.data.options[0].name);
    const game = interaction.data.options[0].options[0].value as gameNames;

    const fullGameName = fullNamesArray[gameNamesArray.indexOf(game as gameNames)];

    const container = new discord.ContainerBuilder();
    const leaderboardData = await getOrderedDB(leaderboard?.db, game).catch(() => []);
    let page = 1;
    let find = null;

    if (interaction.data.options[0].options[1]) {
        const username = interaction.data.options[0].options[1].value as string;
        const user = await parseRobloxAccountV2(username).catch(() => null);
        if (user) {
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

    const format = new Intl.NumberFormat();
    const data = leaderboardData.slice((page - 1) * 100, (page - 1) * 100 + 100);

    container.addTextDisplayComponents((text) =>
        text.setContent(
            `**${leaderboard?.display} Leaderboard for ${fullGameName}**\n-# ${page === 1 ? 'Top 100' : `${format.format(data[0].rank)}-${format.format(data[data.length - 1].rank)} placed`} users as of <t:${Math.floor(Date.now() / 1000)}:f>.`
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
                (leaderboardData.length > 100
                    ? `\n-# And **${leaderboardData.length - page * 100}** other users...`
                    : '')
        )
    );

    container.addActionRowComponents((row) =>
        row.addComponents(
            new discord.ButtonBuilder()
                .setLabel('View Leaderboard')
                .setStyle(discord.ButtonStyle.Link)
                .setURL(`${getURL()}/app/leaderboards?type=${leaderboard?.name}&other=${game}`)
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
