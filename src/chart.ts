import { Chart, registerables } from 'chart.js';
import { Canvas } from '@napi-rs/canvas';
import { statsDB } from './db';
import type { Hono } from 'hono';
import { getURLHost } from './dev';
import { drawRoundedRect } from './util';

Chart.register(...registerables);

export function charts(app: Hono) {
    app.get('/ext/charts/card-requests', async (context) => {
        const data: Array<{ date: string; requests: number }> = [];
        // @ts-ignore-next-line
        for await (const [key, value] of statsDB.iterator()) {
            data.push({ date: key, requests: value });
        }
        const canvas = new Canvas(500, 500);
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
                        label: `Card Requests - ${getURLHost()}`,
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
                plugins: {
                    customCanvasBackgroundColor: {
                        color: '#1c1c1c'
                    },
                    legend: {
                        labels: {
                            color: '#ebebeb'
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
                        drawRoundedRect(ctx, 0, 0, chart.width, chart.height, 0);
                        ctx.restore();
                    }
                }
            ]
        });
        context.header('Content-Type', 'image/png');
        return context.body(await new Blob([canvas.toBuffer('image/png')]).arrayBuffer());
    });
}
