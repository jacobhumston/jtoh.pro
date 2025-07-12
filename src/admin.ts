import { Hono } from 'hono';
import { isSignedInAdmin } from './login-auth';
import { spawn } from './pty';
import os from 'node:os';
import type { WSContext } from 'hono/ws';
import process from 'node:process';
import { getArgsAsString, getURLObj } from './dev';
import { getSignedCookie } from 'hono/cookie';
import { addSocketManager, closeSocket } from './socket';
import { authCookieName, cookieSecret } from './cookies';
import { writeHeapSnapshot } from 'node:v8';
import { v4 } from 'uuid';
import fs from 'node:fs';

if (fs.existsSync('src/web/app/admin/heaps')) {
    for (const file of fs.readdirSync('src/web/app/admin/heaps')) {
        try {
            fs.rmSync(`src/web/app/admin/heaps/${file}`);
        } catch {
            console.error(`Failed to remove heap snapshot ${file}`);
        }
    }
}

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const sockets: Array<WSContext> = [];

const ptyProcess = spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
});

// https://stackoverflow.com/a/28938235

ptyProcess.write(` alias cli="./node_modules/.bin/bun run src/cli/index.ts ${getArgsAsString()}"\r`);
ptyProcess.write(' PS1="$ \\w\n$ -> jtoh.pro$ "\r');

ptyProcess.onData((data) => {
    sockets.forEach((ws) => {
        ws.send(data);
    });
});

export function admin(app: Hono) {
    app.use('/app/admin/*', async (context, next) => {
        if (await isSignedInAdmin(context)) {
            ptyProcess.write(
                ` alias cli="./node_modules/.bin/bun run src/cli/index.ts --cookie=${await getSignedCookie(context, cookieSecret, authCookieName)} ${getArgsAsString()}"\r`
            );
            await next();
        } else {
            return context.json({ error: 'Unauthorized.' }, 401);
        }
    }).use('/api/admin/*', async (context, next) => {
        if (await isSignedInAdmin(context)) {
            await next();
        } else {
            return context.json({ error: 'Unauthorized.' }, 401);
        }
    });

    app.get('/api/admin/routes', async (context) => {
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

    app.get('/api/admin/create-heap-snapshot', async (context) => {
        if (!fs.existsSync('src/web/app/admin/heaps')) fs.mkdirSync('src/web/app/admin/heaps');
        const name = `${v4().split('-')[0]}.heapsnapshot`;
        const path = `src/web/app/admin/heaps/${name}`;
        writeHeapSnapshot(path);
        return context.json({ url: `${getURLObj().href}app/admin/heaps/${name}` });
    });

    addSocketManager('terminal', async (context) => {
        if (!(await isSignedInAdmin(context))) return closeSocket();
        return {
            onMessage: (message) => {
                ptyProcess.write(message.data.toString());
            },
            onClose: (_, ws) => {
                sockets.splice(sockets.indexOf(ws), 1);
            },
            onOpen: (_, ws) => {
                sockets.push(ws);
                ptyProcess.write('\rclear\n');
            }
        };
    });
}
