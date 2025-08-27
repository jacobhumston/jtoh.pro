import * as discord from 'discord.js';
import { rest } from '../rest';
import { discordInteractionsApplicationId, towerStatsVercelBypassToken } from '../../tokens';
//import { getURL } from '../../dev';
import { parseRobloxAccountV2 } from '../../login-auth';
import { autocompleteUserSelection, getFocusedOptionName, getFocusedOptionValue } from '../autocomplete';
import { addRecent } from '../util';
import puppeteer from 'puppeteer';
import fuse from 'fuse.js';
//import { wait } from '../../util';
import lodash from 'lodash';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
let games: Array<string>;

{
    const page = await browser.newPage();
    page.setExtraHTTPHeaders({
        'x-vercel-protection-bypass': towerStatsVercelBypassToken,
        'x-vercel-set-bypass-cookie': 'true'
    });

    const response = await page.goto('https://www.towerstats.com/api/get_home_info', { waitUntil: 'load' });

    if (!response) throw new Error('Failed to fetch TowerStats API data');

    const data: {
        dau: {
            [key: string]: number;
        };
    } = await response.json();

    games = Object.keys(data.dau).sort((a, b) => data.dau[b] - data.dau[a]);

    await page.close();
}

console.log(games);

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
    ])
    .addStringOption((option) =>
        option.setName('game').setDescription('The game to view the page of.').setRequired(true).setAutocomplete(true)
    )
    .addStringOption((option) =>
        option.setName('user').setDescription('The user to view the page for.').setRequired(true).setAutocomplete(true)
    );

export async function execute(interaction: discord.APIChatInputApplicationCommandInteraction) {
    const form = new FormData();

    if (!interaction.data.options) return;

    if (interaction.data.options[0].type !== discord.ApplicationCommandOptionType.String) return;
    if (interaction.data.options[1].type !== discord.ApplicationCommandOptionType.String) return;

    const game = interaction.data.options[0].value;
    const username = interaction.data.options[1].value;

    const container = new discord.ContainerBuilder();
    const user = await parseRobloxAccountV2(username as string);

    if (user && games.includes(game)) {
        await addRecent(interaction, user.name);

        const page = await browser.newPage();
        page.setExtraHTTPHeaders({
            'x-vercel-protection-bypass': towerStatsVercelBypassToken,
            'x-vercel-set-bypass-cookie': 'true'
        });

        //page.setViewport({ width: 1920, height: 1080 });

        await page.goto(`https://www.towerstats.com/${game}?username=${user.name}`, {
            waitUntil: 'load'
        });

        await page.waitForFunction('document.querySelector("#loading-container").style.opacity === "0"', {
            timeout: 120000
        });

        const areas = await page.$$('.area');
        const chunks = lodash.chunk(areas.splice(0, 10), 10);

        let index = -1;
        for (const chunk of chunks) {
            const imageNames: Array<string> = [];
            for (const area of chunk) {
                console.log(area);
                await area.scrollIntoView();
                index++;
                const image = await area
                    .screenshot({ type: 'webp', encoding: 'binary', quality: 100 })
                    .catch(() => null);
                if (image === null) continue;
                form.append(
                    `file[${index}]`,
                    new Blob([Buffer.from(image)], { type: 'image/webp' }),
                    `towerstats${index}.webp`
                );
                imageNames.push(`towerstats${index}.webp`);
            }

            container.addMediaGalleryComponents((media) =>
                media.addItems(
                    ...imageNames.map((name) => new discord.MediaGalleryItemBuilder().setURL(`attachment://${name}`))
                )
            );
        }

        await page.close();
    } else if (user && !games.includes(game)) {
        container.addTextDisplayComponents((text) =>
            text.setContent(
                `**The game you requested does not exist.** Please input a valid game acronym!\n\nAvailable Games: ${games.map((game) => `\`${game}\``).join(', ')}`
            )
        );
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
    const focusedValue = getFocusedOptionValue(interaction) as string;
    if (focusedOptionName === 'game') {
        const result = new fuse(games, {
            threshold: 0.4
        });

        const results = result.search(focusedValue, { limit: 25 });
        const choices = results.map((result) => ({
            name: result.item,
            value: result.item
        }));

        if (choices.length === 0)
            return {
                choices: [...games].splice(0, 25).map((game) => ({ name: game, value: game }))
            };

        return { choices };
    }
    if (focusedOptionName !== 'user') return { choices: [] };
    return await autocompleteUserSelection(interaction);
}
