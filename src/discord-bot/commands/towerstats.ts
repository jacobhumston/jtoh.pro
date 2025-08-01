import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId } from '../../tokens';
import { getURL } from '../../dev';
import { parseRobloxAccountV2 } from '../../login-auth';
import { autocompleteUserSelection, getFocusedOptionName } from '../autocomplete';
import { addRecent } from '../util';
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
let games: Array<string>;

{
    const page = await browser.newPage();
    const response = await page.goto('https://www.towerstats.com/api/get_home_info', { waitUntil: 'domcontentloaded' });

    if (!response) throw new Error('Failed to fetch TowerStats API data');
    if (response.headers()['content-type'] !== 'application/json')
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10 * 1000 * 60 });
    const data = await response.json();
    games = Object.keys(data.dau);
    await page.close();
}

export const command = new discord.SlashCommandBuilder()
    .setName('towerstats')
    .setDescription("View a user's towerstats page.")
    .setContexts([
        discord.InteractionContextType.BotDM,
        discord.InteractionContextType.PrivateChannel,
        discord.InteractionContextType.Guild
    ])
    .setIntegrationTypes([
        discord.ApplicationIntegrationType.GuildInstall,
        discord.ApplicationIntegrationType.UserInstall
    ]);

games.forEach((game) => {
    command.addSubcommand((subcommand) => {
        subcommand
            .setName(game)
            .setDescription(`View TowerStats.com ${game} page.`)
            .addStringOption((option) =>
                option
                    .setName('user')
                    .setDescription('The user to view the page for.')
                    .setRequired(true)
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

    const game = interaction.data.options[0].name;
    const username = interaction.data.options[0].options[0].value;

    const container = new discord.ContainerBuilder();
    const user = await parseRobloxAccountV2(username as string);

    if (user) {
        await addRecent(interaction, user.name);
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
