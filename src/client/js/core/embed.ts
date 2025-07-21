import { getElementById, waitForPageLoad } from '../libs/util';
import { gameNamesArray } from '../../../shared/gamelist';
import hljs from 'highlight.js';

export default async function () {
    await waitForPageLoad();

    hljs.highlightAll();

    const listElement = getElementById('gamesList') as HTMLDivElement;
    listElement.innerHTML = gameNamesArray.map((game) => `<code>${game}</code>`).join(', ');

    // @ts-expect-error
    const embeddable = globalThis.jtohProEmbed;
    const embed = await embeddable.new('embedContainer');
    await embed.set('loveliestjacob', 'cscd', 'mode=legit');
}
