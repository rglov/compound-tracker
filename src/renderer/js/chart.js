let hormonesChart = null;
let peptidesChart = null;

const PEPTIDE_CATEGORIES = new Set(['peptide']);
const HORMONE_CATEGORIES = new Set(['aas', 'hgh']);

function createChartInstance(canvas, yLabel) {
  if (!canvas) return null;
  const Chart = window.Chart;
  const { DateTime } = window.luxon;

  return new Chart(canvas, {
    type: 'line',
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          type: 'time',
          adapters: {
            date: { zone: DateTime.local().zoneName }
          },
          time: {
            tooltipFormat: 'MMM d, yyyy',
            displayFormats: {
              millisecond: 'HH:mm:ss',
              second: 'HH:mm:ss',
              minute: 'HH:mm',
              hour: 'MMM d, ha',
              day: 'MMM d',
              week: 'MMM d',
              month: 'MMM yyyy',
              year: 'yyyy'
            }
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#a0a0b0',
            font: { size: 10 },
            maxTicksLimit: 10
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#a0a0b0',
            font: { size: 10 }
          },
          title: {
            display: true,
            text: yLabel,
            color: '#a0a0b0',
            font: { size: 11 }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#2a2a3e',
          titleColor: '#fff',
          bodyColor: '#ccc',
          borderColor: '#3a3a5a',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(ctx) {
              const ds = ctx.dataset;
              const val = ctx.parsed.y;
              const unit = ds.unit || '';
              return ds.label + ': ' + val.toFixed(2) + ' ' + unit;
            }
          }
        }
      }
    },
    plugins: [{
      id: 'nowLine',
      afterDraw(chart) {
        const now = Date.now();
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const xPixel = xScale.getPixelForValue(now);
        if (xPixel < xScale.left || xPixel > xScale.right) return;

        const ctx = chart.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(67, 97, 238, 0.6)';
        ctx.lineWidth = 1;
        ctx.moveTo(xPixel, yScale.top);
        ctx.lineTo(xPixel, yScale.bottom);
        ctx.stroke();

        ctx.fillStyle = 'rgba(67, 97, 238, 0.8)';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('now', xPixel, yScale.top - 4);
        ctx.restore();
      }
    }]
  });
}

function initChart() {
  hormonesChart = createChartInstance(
    document.getElementById('decay-chart-hormones'),
    'Level (mg)'
  );
  peptidesChart = createChartInstance(
    document.getElementById('decay-chart-peptides'),
    'Level (mcg)'
  );
}

function updateChart(seriesData, windowRange) {
  const hormonesDatasets = [];
  const peptidesDatasets = [];

  for (const [compoundId, series] of Object.entries(seriesData)) {
    const ds = {
      label: series.compoundName,
      data: series.data.map(p => ({ x: p.x, y: p.y })),
      borderColor: series.color,
      backgroundColor: series.color + '20',
      borderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 8,
      fill: true,
      tension: 0.3,
      unit: series.unit
    };

    if (PEPTIDE_CATEGORIES.has(series.category)) {
      peptidesDatasets.push(ds);
    } else {
      hormonesDatasets.push(ds);
    }
  }

  // Update both charts
  updateSingleChart(hormonesChart, hormonesDatasets, windowRange);
  updateSingleChart(peptidesChart, peptidesDatasets, windowRange);
}

function updateSingleChart(chart, datasets, windowRange) {
  if (!chart) return;

  chart.data.datasets = datasets;

  if (windowRange && typeof windowRange.min === 'number' && typeof windowRange.max === 'number') {
    chart.options.scales.x.min = windowRange.min;
    chart.options.scales.x.max = windowRange.max;
  } else {
    chart.options.scales.x.min = undefined;
    chart.options.scales.x.max = undefined;
  }

  chart.update();
}

function toggleChartDataset(chartName, index) {
  const chart = chartName === 'hormones' ? hormonesChart : peptidesChart;
  if (!chart || !chart.data.datasets[index]) return;
  chart.data.datasets[index].hidden = !chart.data.datasets[index].hidden;
  chart.update();
}

function destroyChart() {
  if (hormonesChart) {
    hormonesChart.destroy();
    hormonesChart = null;
  }
  if (peptidesChart) {
    peptidesChart.destroy();
    peptidesChart = null;
  }
}
