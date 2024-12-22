import { Hono } from 'hono';

export default function redirects(app: Hono) {
    const redirectRoutes = [
        { path: '/jtohxl/', target: '/app/fangame/jtohxl/' },
        { path: '/cscd/', target: '/app/fangame/cscd/' },
        { path: '/atos/', target: '/app/fangame/atos/' },
        { path: '/eta/', target: '/app/fangame/eta/' },
        { path: '/jtohxxl/', target: '/app/fangame/jtohxxl/' },
        { path: '/app', target: '/app/' },
        { path: '/uptime', target: 'https://uptime.jtoh.pro' },
        { path: '/terms', target: '/app/terms' },
        { path: '/privacy', target: '/app/privacy' },
        { path: '/discord-bot', target: 'https://discord.com/oauth2/authorize?client_id=1285148080189997107' },
        { path: '/login', target: '/ext/auth' },
        { path: '/logout', target: '/ext/auth/logout' },
        { path: '/app/admin', target: '/app/admin/' },
        { path: '/app/update-log', target: '/app/announcements' },
        { path: '/wiki', target: '/wiki/' }
    ];

    redirectRoutes.forEach((route) => {
        app.get(route.path, async (context) => {
            const searchParams = new URL(context.req.url).searchParams;
            const searchParamsString = searchParams.toString().length > 0 ? '?' + searchParams.toString() : '';
            return context.redirect(route.target + searchParamsString);
        });
    });
}
