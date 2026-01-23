/**
 * Test the WebGPU chart module.
 *
 * Authored by Jacob Humston
 */
import { ChartGPU, type ChartGPUOptions } from 'chartgpu';
import type { Mutable } from 'utility-types';

import { getCurrentChartTheme, themeEvents } from '@client/modules/theme';

const options: Mutable<ChartGPUOptions> = {
    series: [
        {
            type: 'pie',
            data: [
                { name: 'thing1', value: 10 },
                { name: 'thing5', value: 20 }
            ]
        }
    ],
    theme: getCurrentChartTheme()
};

const container = document.getElementById('chart')!;
const chart = await ChartGPU.create(container, options);

themeEvents.attach((event) => {
    if (event === 'updated') {
        options.theme = getCurrentChartTheme();
        chart.setOption(options);
    }
});
