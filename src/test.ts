import { Chart, registerables } from 'chart.js';
import { Canvas } from '@napi-rs/canvas';

const canvas = new Canvas(800, 600);

Chart.register(...registerables);

new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

console.log(await canvas.toDataURLAsync());