import * as discord from 'discord.js';
import { discordBotConfigDB } from '../db';
import { getUserId } from './util';

const empty = { choices: [] };

export async function autocompleteUserSelection(
    interaction: discord.APIApplicationCommandAutocompleteInteraction
): Promise<discord.APICommandAutocompleteInteractionResponseCallbackData> {
    const config = (await discordBotConfigDB.get(`${getUserId(interaction)}`)) ?? {};

    if (!config.ac_recent) config.ac_recent = [];
    if (!config.ac_pinned) config.ac_pinned = [];

    if (config.ac_recent.length === 0 && config.ac_pinned.length === 0) return empty;

    const choices: discord.APIApplicationCommandOptionChoice<string>[] = [];

    for (const recent of config.ac_recent) {
        if (config.ac_pinned.includes(recent)) continue;
        choices.push({
            name: '⏰ ' + recent,
            value: recent
        });
    }

    for (const pin of config.ac_pinned) {
        choices.push({
            name: '📌 ' + pin,
            value: pin
        });
    }

    return { choices: choices };
}

export function getFocusedOptionName(
    interaction: discord.APIApplicationCommandAutocompleteInteraction
): string | undefined {
    let focusedOption: string | undefined;

    for (const option of interaction.data.options) {
        if (option.type === discord.ApplicationCommandOptionType.String && option.focused) {
            focusedOption = option.name;
            break;
        }
        if (option.type === discord.ApplicationCommandOptionType.Subcommand) {
            for (const subOption of option.options || []) {
                if (subOption.type === discord.ApplicationCommandOptionType.String && subOption.focused) {
                    focusedOption = subOption.name;
                    break;
                }
            }
        }
    }

    return focusedOption;
}
