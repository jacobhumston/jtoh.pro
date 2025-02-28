import { Chart, registerables } from 'chart.js';
import { Canvas } from '@napi-rs/canvas';
import { statsDB } from './db';
import type { Hono } from 'hono';
import { getURLHost } from './dev';
import { clamp, drawRoundedRect } from './util';
import { gameNamesArray, type gameNames } from './shared/gamelist';

Chart.register(...registerables);
Chart.defaults.font.family = 'Poppins';

export function charts(app: Hono) {
    app.get('/api/charts/card-requests/:game', async (context) => {
        if (!gameNamesArray.includes(context.req.param('game') as any))
            return context.json({ error: 'Invalid game.' }, 400);

        const game = context.req.param('game') as gameNames;

        const data: Array<{ date: string; requests: number }> = [];
        // @ts-ignore-next-line
        for await (const [key, value] of statsDB[game].iterator()) {
            data.push({ date: key, requests: value });
        }

        const width = parseInt(context.req.query('width') ?? '500');
        const height = parseInt(context.req.query('height') ?? '500');

        const canvas = new Canvas(clamp(width, 100, 500), clamp(height, 100, 500));
        // @ts-ignore-next-line
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: data.map((x) =>
                    new Date(x.date.replaceAll('-', '/')).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })
                ),
                datasets: [
                    {
                        label: `Card Requests`,
                        data: data.map((x) => x.requests),
                        fill: true,
                        tension: 0.1,
                        color: '#ebebeb',
                        backgroundColor: '#ff4336',
                        borderColor: '#f7685e'
                    }
                ]
            },
            options: {
                font: {
                    family: 'Poppins'
                },
                plugins: {
                    customCanvasBackgroundColor: {
                        color: '#1c1c1c'
                    },
                    legend: {
                        labels: {
                            color: '#ebebeb',
                            font: {
                                family: 'Poppins'
                            }
                        }
                    },
                    title: {
                        display: false,
                        text: `${getURLHost()} - ${new Date().toDateString()}`,
                        color: '#ebebeb',
                        font: {
                            family: 'Poppins'
                        }
                    }
                },
                layout: {
                    padding: 10
                },
                scales: {
                    y: {
                        grid: {
                            color: '#828282'
                        },
                        ticks: {
                            color: '#ebebeb'
                        }
                    },
                    x: {
                        grid: {
                            color: '#828282'
                        },
                        ticks: {
                            color: '#ebebeb'
                        }
                    }
                }
            },
            plugins: [
                {
                    id: 'customCanvasBackgroundColor',
                    beforeDraw: (chart, _, options) => {
                        const { ctx } = chart;
                        ctx.save();
                        ctx.globalCompositeOperation = 'destination-over';
                        ctx.fillStyle = options.color;
                        // @ts-ignore-next-line
                        drawRoundedRect(ctx, 0, 0, chart.width, chart.height, 10);
                        ctx.restore();
                    }
                }
            ]
        });
        context.header('Content-Type', 'image/png');
        return context.body(await new Blob([canvas.toBuffer('image/png')]).arrayBuffer());
    });
}
