import { getElementById, waitForPageLoad } from '../libs/util';
import { gameNamesArray } from '../../../shared/gamelist';

export default async function () {
    await waitForPageLoad();

    // @ts-expect-error
    hljs.highlightAll();

    const listElement = getElementById('gamesList') as HTMLDivElement;
    listElement.innerHTML = gameNamesArray.map((game) => `<code>${game}</code>`).join(', ');

    // @ts-expect-error
    const embeddable = globalThis.jtohProEmbed;
    const embed = await embeddable.new('embedContainer');
    await embed.set('loveliestjacob', 'cscd', 'mode=legit');
}
