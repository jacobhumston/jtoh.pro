import { Hono } from 'hono';
import { isSignedInAdmin } from './loginauth';

export function admin(app: Hono) {
    app.use('/app/admin/*', async (context, next) => {
        if (await isSignedInAdmin(context)) {
            await next();
        } else {
            return context.json({ error: 'Unauthorized.' }, 401);
        }
    }).use('/ext/admin/*', async (context, next) => {
        if (await isSignedInAdmin(context)) {
            await next();
        } else {
            return context.json({ error: 'Unauthorized.' }, 401);
        }
    });
}
