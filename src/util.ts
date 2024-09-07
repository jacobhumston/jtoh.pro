import type { Canvas, SKRSContext2D } from '@napi-rs/canvas';

export function drawRoundedRect(
    ctx: SKRSContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

export function colorText(
    ctx: SKRSContext2D,
    str: string,
    color: Array<{ string: string; color: string }>,
    x: number,
    y: number,
    pastColor: string
) {
    const words = str.split(' ');
    let currentX = x;
    for (let word of words) {
        const thisColor = color.find((c) => c.string === word);
        if (thisColor) {
            ctx.fillStyle = thisColor.color;
        }
        word = word.replaceAll('_', ' ');
        ctx.fillText(word, currentX, y);
        ctx.fillStyle = pastColor;
        currentX += ctx.measureText(word + ' ').width;
    }
}

export function centerText(canvas: Canvas, ctx: SKRSContext2D, str: string): number {
    return (canvas.width - ctx.measureText(str).width) / 2;
}

/**
 * Randomizes the upper and lowercase of each character in the input string.
 * @param input - The string to be randomized.
 * @returns A new string with randomized upper and lowercase characters.
 */
export function randomizeCase(input: string): string {
    return input
        .split('')
        .map((char) => {
            if (Math.random() > 0.5) {
                return char.toUpperCase();
            } else {
                return char.toLowerCase();
            }
        })
        .join('');
}
