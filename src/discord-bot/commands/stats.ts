import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { fullNamesArray, gameNamesArray, type gameNames } from '../../shared/gamelist';
import { UTCDate } from '@date-fns/utc';
import { isAfter, isToday, parse, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { statsDB } from '../../db';
import { getURL } from '../../dev';

export const command = new discord.SlashCommandBuilder()
    .setName('stats')
    .setDescription('Get the jtoh.pro card request stats for a game.')
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
        subcommand.setName(game).setDescription(`Get the jtoh.pro stats for ${fullNamesArray[index]} card requests.`);
        return subcommand;
    });
});

export async function execute(interaction: discord.APIChatInputApplicationCommandInteraction) {
    const form = new FormData();

    if (!interaction.data.options) return;

    if (interaction.data.options[0].type !== discord.ApplicationCommandOptionType.Subcommand) return;
    if (interaction.data.options[0].options === undefined) return;

    const game = interaction.data.options[0].name;
    const fullGameName = fullNamesArray[gameNamesArray.indexOf(game as gameNames)];

    const container = new discord.ContainerBuilder();

    container.addTextDisplayComponents((text) => text.setContent(`**Card Request Stats for ${fullGameName}**`));

    const now = new UTCDate();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfCurrentWeek = startOfWeek(now);
    const startOfCurrentYear = startOfYear(now);

    let todayCount = 0;
    let monthCount = 0;
    let weekCount = 0;
    let yearCount = 0;
    let totalCount = 0;

    // @ts-ignore-next-line
    for await (const [key, value] of statsDB[game].iterator()) {
        const date = parse(key, 'MM-dd-yyyy', new UTCDate());

        if (isToday(date)) todayCount += value;

        if (isAfter(date, startOfCurrentMonth) || isToday(date)) monthCount += value;

        if (isAfter(date, startOfCurrentWeek) || isToday(date)) weekCount += value;

        if (isAfter(date, startOfCurrentYear) || isToday(date)) yearCount += value;

        totalCount += value;
    }

    container.addTextDisplayComponents((text) =>
        text.setContent(
            `**Today:** ${todayCount}\n` +
                `**This Week:** ${weekCount}\n` +
                `**This Month:** ${monthCount}\n` +
                `**This Year:** ${yearCount}\n` +
                `**Total:** ${totalCount}`
        )
    );

    container.addMediaGalleryComponents((gallery) =>
        gallery.addItems((item) => item.setURL(`${getURL()}/api/charts/card-requests/${game}`))
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
