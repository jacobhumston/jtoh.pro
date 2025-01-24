import { loadImage, createCanvas, Canvas } from '@napi-rs/canvas';
import fs from 'node:fs';

// Load default images
const defaultImages = {
    questionMarkMan: await loadImage('src/web/app/assets/question-mark-man.png'),
    defaultRobloxProfile: await loadImage('src/web/app/assets/default-roblox-profile.png')
};

export default defaultImages;

// Ensure blog images directory exists
const BLOG_IMAGES_DIR = 'src/web/app/blog/images';
if (!fs.existsSync(BLOG_IMAGES_DIR)) {
    fs.mkdirSync(BLOG_IMAGES_DIR, { recursive: true });
}

interface BlogPostImageData {
    title: string;
    author: {
        displayName: string;
        thumbnail: string;
    };
    summary: string;
}

export async function generateBlogPostImage(data: BlogPostImageData): Promise<string> {
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 1200, 630);

    // Add border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 1190, 620);

    // Add title
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    const titleLines = wrapText(ctx, data.title, 1000, 48);
    titleLines.forEach((line, i) => {
        ctx.fillText(line, 50, 80 + (i * 60));
    });

    // Add summary
    ctx.font = '32px Arial';
    const summaryLines = wrapText(ctx, data.summary, 1000, 32);
    summaryLines.forEach((line, i) => {
        ctx.fillText(line, 50, 280 + (i * 40));
    });

    // Add author thumbnail
    try {
        const authorImage = await loadImage(data.author.thumbnail);
        // Draw circular avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(90, 550, 30, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(authorImage, 60, 520, 60, 60);
        ctx.restore();
    } catch (error) {
        // If thumbnail fails to load, skip it
        console.error('Failed to load author thumbnail:', error);
    }

    // Add author info
    ctx.font = '24px Arial';
    ctx.fillStyle = '#888888';
    ctx.fillText(`Written by ${data.author.displayName}`, 160, 560);

    // Add site URL
    ctx.fillText('jtoh.pro', 1050, 560);

    // Generate unique filename
    const filename = `${Date.now()}-${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    const filepath = `${BLOG_IMAGES_DIR}/${filename}`;

    // Save the image
    fs.writeFileSync(filepath, canvas.toBuffer('image/png'));

    return `/app/blog/images/${filename}`;
}

function wrapText(ctx: Canvas['getContext2d'], text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
