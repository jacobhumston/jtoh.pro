import { EmbedBuilder, escapeMarkdown, WebhookClient } from 'discord.js';
import { Hono } from 'hono';
import { discordFeedbackWebhook } from './tokens';
import { createRateLimitMiddleware } from './rate-limits';
import { getSignedInRobloxUser } from './login-auth';
import { verifyContext } from './captcha';

const feedbackWebhook = new WebhookClient({ url: discordFeedbackWebhook });

export async function listenForFeedback(app: Hono) {
    app.post('/api/feedback/submit', createRateLimitMiddleware({ hours: 1 }, 3), async (context) => {
        const captchaResponse = await verifyContext(context);
        if (captchaResponse) return captchaResponse;

        const json = await context.req.json().catch(() => null);
        if (!json) return context.json({ error: 'Invalid JSON in request body.' }, 400) as any;
        if (!json.service || !json.input || typeof json.service !== 'string' || typeof json.input !== 'string')
            return context.json({ error: 'Missing required feedback fields.' }, 400) as any;

        const service = escapeMarkdown(json.service) as string;
        const input = escapeMarkdown(json.input) as string;
        if (service.length < 1 || service.length > 100 || input.length < 100 || input.length > 1000)
            return context.json({ error: 'Invalid field lengths (1,100/100,1000)' }, 400) as any;

        const user = await getSignedInRobloxUser(context);
        const embed = new EmbedBuilder();

        embed.setTitle('Feedback Submitted');
        embed.setColor('Random');
        embed.setTimestamp(new Date());
        embed.setFooter({ text: `${context.req.path}` });
        embed.addFields([
            { name: 'Service', value: service },
            { name: 'Input', value: input }
        ]);
        if (user) {
            embed.setDescription(`This feedback was submitted by ${user.username} (\`${user.id}\`).`);
        } else {
            embed.setDescription('This feedback was submitted anonymously.');
        }

        feedbackWebhook.send({ embeds: [embed] }).catch(() => {});

        return context.json({ success: true });
    });
}
