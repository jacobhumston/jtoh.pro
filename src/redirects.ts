import { Hono } from 'hono';

export default function redirects(app: Hono) {
    app.get('/favicon.ico', async (context) => {
        return context.redirect('/app/assets/favicon.ico');
    });

    app.get('/jtohxl/', async (context) => {
        return context.redirect('/app/fangame/jtohxl/');
    });

    app.get('/cscd/', async (context) => {
        return context.redirect('/app/fangame/cscd/');
    });

    app.get('/atos/', async (context) => {
        return context.redirect('/app/fangame/atos/');
    });

    app.get('/eta/', async (context) => {
        return context.redirect('/app/fangame/eta/');
    });

    app.get('/app', async (context) => {
        return context.redirect('/app/');
    });
}
