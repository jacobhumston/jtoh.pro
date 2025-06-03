import { Hono } from 'hono';

export default function redirects(app: Hono) {
    const redirectRoutes = [
        { path: '/app', target: '/app/' },
        { path: '/uptime', target: 'https://uptime.jtoh.pro' },
        { path: '/terms', target: '/app/terms' },
        { path: '/privacy', target: '/app/privacy' },
        { path: '/cookie-policy', target: '/app/cookie-policy' },
        { path: '/discord-bot', target: 'https://discord.com/oauth2/authorize?client_id=1285148080189997107' },
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
        { path: '/redirect', target: '/app/redirect' }
    ];

    redirectRoutes.forEach((route) => {
        app.get(route.path, async (context) => {
            const searchParams = new URL(context.req.url).searchParams;
            const searchParamsString = searchParams.toString().length > 0 ? '?' + searchParams.toString() : '';
            return context.redirect(route.target + searchParamsString);
        });
    });
}
