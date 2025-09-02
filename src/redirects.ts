import { Hono } from 'hono';

export default function redirects(app: Hono) {
    const redirectRoutes = [
        { path: '/app', target: '/app/' },
        { path: '/uptime', target: 'https://uptime.jtoh.pro' },
        { path: '/terms', target: '/app/docs/terms' },
        { path: '/privacy', target: '/app/docs/privacy' },
        { path: '/cookie-policy', target: '/app/docs/cookies' },
        { path: '/refunds', target: '/app/docs/refunds' },
        { path: '/copyright', target: '/app/docs/copyright' },
        { path: '/contact', target: '/app/contact' },
        { path: '/cookies', target: '/app/docs/cookies' },
        { path: '/discord-bot', target: 'https://discord.com/oauth2/authorize?client_id=1285148080189997107' },
        { path: '/discord-server', target: 'https://discord.jtoh.pro' },
        { path: '/login', target: '/api/auth' },
        { path: '/logout', target: '/api/auth/logout' },
        { path: '/app/admin', target: '/app/admin/' },
        { path: '/app/update-log', target: '/app/blog' },
        { path: '/wiki', target: '/wiki/' },
        { path: '/blog', target: '/app/blog' },
        { path: '/app/blog/', target: '/app/blog' },
        { path: '/app/jtoh', target: '/app/etoh' },
        { path: '/faq', target: '/app/faq' },
        { path: '/FAQ', target: '/app/faq' },
        { path: '/redirect', target: '/app/redirect' },
        { path: '/app/terms', target: '/app/docs/terms' },
        { path: '/app/privacy', target: '/app/docs/privacy' },
        { path: '/app/cookie-policy', target: '/app/docs/cookies' },
        { path: '/feedback', target: '/app/feedback' }
    ];

    redirectRoutes.forEach((route) => {
        app.get(route.path, async (context) => {
            const searchParams = new URL(context.req.url).searchParams;
            if (searchParams.has('ref')) searchParams.delete('ref');
            const searchParamsString = searchParams.toString().length > 0 ? '?' + searchParams.toString() : '';
            return context.redirect(route.target + searchParamsString);
        });
    });
}
