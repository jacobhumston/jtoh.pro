import type { Canvas, SKRSContext2D } from '@napi-rs/canvas';
import crypto from 'node:crypto';

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

export function drawRoundedRectv2(
    ctx: SKRSContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radii: {
        topLeft: number;
        topRight: number;
        bottomRight: number;
        bottomLeft: number;
    }
) {
    const { topLeft, topRight, bottomRight, bottomLeft } = radii;

    ctx.beginPath();
    ctx.moveTo(x + topLeft, y);
    ctx.lineTo(x + width - topRight, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
    ctx.lineTo(x + width, y + height - bottomRight);
    ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
    ctx.lineTo(x + bottomLeft, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
    ctx.lineTo(x, y + topLeft);
    ctx.quadraticCurveTo(x, y, x + topLeft, y);
    ctx.closePath();
    ctx.fill();
}

export function colorText(
    ctx: SKRSContext2D,
    str: string,
    color: Array<{
        string: string;
        color: string;
        beforeCallback?: (prevX: number, word: string, color: string) => void;
        afterCallback?: (prevX: number, word: string, color: string) => void;
    }>,
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
        const prevX = currentX;
        word = word.replaceAll('_', ' ');
        if (thisColor?.beforeCallback) {
            thisColor.beforeCallback(prevX, word, thisColor.color);
        }
        ctx.fillText(word, currentX, y);
        ctx.fillStyle = pastColor;
        currentX += ctx.measureText(word + ' ').width;
        if (thisColor?.afterCallback) {
            thisColor.afterCallback(prevX, word, thisColor.color);
        }
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

export function encryptCode(code: string, key: string): string {
    const algorithm = 'aes-256-ctr';
    const iv = crypto.randomBytes(16);
    // @ts-ignore-next-line
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(code, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptCode(encryptedCode: string, key: string): string {
    const algorithm = 'aes-256-ctr';
    const [iv, encrypted] = encryptedCode.split(':');
    // @ts-ignore-next-line
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
