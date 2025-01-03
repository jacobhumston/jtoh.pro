import { Hono } from 'hono';
import { isSignedInAdmin } from './loginauth';
import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';
import pty from 'node-pty';
import os from 'os';
import type { WSContext } from 'hono/ws';

const { upgradeWebSocket } = createBunWebSocket<ServerWebSocket>();

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const sockets: Array<WSContext> = [];

const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
});

ptyProcess.onData((data) => {
    sockets.forEach((ws) => {
        ws.send(data);
    });
});

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

    app.get('/ext/admin/routes', async (context) => {
        return context.json({
            routes: app.routes.map((route) => {
                return {
                    method: route.method,
                    path: route.path,
                    handler: route.handler.name
                };
            })
        });
    });

    app.get(
        '/ext/admin/terminal',
        upgradeWebSocket(() => {
            return {
                onMessage: (message) => {
                    ptyProcess.write(message.data.toString());
                },
                onClose: (_, ws) => {
                    sockets.splice(sockets.indexOf(ws), 1);
                },
                onOpen: (_, ws) => {
                    sockets.push(ws);
                }
            };
        })
    );
}
