import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';
import type { WSContext } from 'hono/ws';
import type { Hono, Context } from 'hono';

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

type WebsocketHandler = ReturnType<Parameters<typeof upgradeWebSocket>[0]>;

export const socket = websocket;
export const sockets: () => Array<WSContext> = () => [];
export const socketManagers = new Map<string, (context: Context) => WebsocketHandler>();

export function addSocketManager(type: string, manager: (context: Context) => WebsocketHandler) {
    socketManagers.set(type, manager);
}

export function socketListen(app: Hono) {
    app.get(
        '/api/socket',
        upgradeWebSocket((context) => {
            const type = context.req.query('type');
            const manager = socketManagers.get(type ?? '');
            if (manager) {
                return manager(context);
            } else {
                return closeSocket();
            }
        })
    );
}

export function closeSocket(): WebsocketHandler {
    return {
        onOpen(_, ws) {
            ws.close(1008);
        },
        onMessage() {},
        onClose() {}
    };
}
