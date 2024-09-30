import { Hono } from 'hono';

export default function redirects(app: Hono) {
    const redirectRoutes = [
        { path: '/jtohxl/', target: '/app/fangame/jtohxl/' },
        { path: '/cscd/', target: '/app/fangame/cscd/' },
        { path: '/atos/', target: '/app/fangame/atos/' },
        { path: '/eta/', target: '/app/fangame/eta/' },
        { path: '/app', target: '/app/' },
        { path: '/uptime', target: 'https://uptime.jtoh.pro' }
    ];

    redirectRoutes.forEach((route) => {
        app.get(route.path, async (context) => {
            return context.redirect(route.target);
        });
    });
}
