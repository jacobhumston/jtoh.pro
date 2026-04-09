/**
 * Arrows game script.
 *
 * Authored by Jacob Humston
 */

import { domReady } from '@jsfns/web';
import { Random } from 'random';

import storage from '@client/modules/storage';
import { createElement } from '@client/utils/elements';

const arrowTypes = ['arrow_downward', 'arrow_back', 'arrow_forward', 'arrow_upward'];
type ArrowTypes = 'arrow_downward' | 'arrow_back' | 'arrow_forward' | 'arrow_upward';
await new Promise((resolve) => domReady(() => resolve(0)));

const arrows: Array<{ element: HTMLSpanElement; arrow: ArrowTypes }> = [];
const arrowsContainer = document.getElementById('arrows') as HTMLElement;
const scoreP = document.getElementById('score') as HTMLParagraphElement;

let itemId = 0;
let score = 0;
const f = Intl.NumberFormat();
function update() {
    scoreP.innerHTML = `Score: ${f.format(score)}<br><span id="best">Best: ${f.format(storage.getItem('arrowGameBestScore') ?? 0)}</span>`;
    while (arrows.length < 6) {
        itemId++;
        const type = new Random().choice(arrowTypes);
        const element = createElement('span', { className: 'icon', innerText: type });
        element.style.viewTransitionName = `item-${itemId}`;
        arrowsContainer.append(element);
        arrows.push({ element, arrow: type as ArrowTypes });
    }
}

update();

async function keyPress(key: ArrowTypes) {
    const first = arrows[0];
    if (first && first.arrow !== key) {
        score = 0;
        update();
        first.element.style.color = 'var(--red)';
    } else if (first && first.arrow === key) {
        score++;
        if (score > (storage.getItem('arrowGameBestScore') ?? 0)) {
            storage.setItem('arrowGameBestScore', score);
        }
        first.element.style.color = 'var(--green)';
        document.startViewTransition(async () => {
            first.element.remove();
            arrows.shift();
            update();
        });
    }
}

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowDown':
            keyPress('arrow_downward');
            break;
        case 'ArrowUp':
            keyPress('arrow_upward');
            break;
        case 'ArrowLeft':
            keyPress('arrow_back');
            break;
        case 'ArrowRight':
            keyPress('arrow_forward');
            break;
    }
});
