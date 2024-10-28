<template>
  <div :id="props.chart_id" class="chart-container"></div>
</template>

<script setup lang="ts">
import { defineProps, watchEffect, onBeforeUnmount, nextTick } from 'vue';
import Highcharts, { SeriesLineOptions, Chart, Options } from 'highcharts';

const props = defineProps<{
  title: string;
  data: {
    categories: string[];
    series: SeriesLineOptions[];
  };
  chart_id: string;
}>();

let chartInstance: Chart | null = null;

// Function to calculate tick interval based on data range
const calculateTickInterval = () => {
  const targetLabels = 10;
  const timestamps = props.data.categories.map(date => new Date(date).getTime());
  const range = Math.max(...timestamps) - Math.min(...timestamps);
  const tickInterval = range / targetLabels;
  return tickInterval;
};

// Function to create the chart
const createChart = () => {
  const chartContainer = document.getElementById(props.chart_id);

  if (!chartContainer) {
    console.error('Chart container not found:', props.chart_id);
    return;
  }

  const calculatedTickInterval = calculateTickInterval();

  const chartSeries = props.data.series.length
    ? props.data.series
    : [{
        type: 'line',
        name: 'No data available',
        data: [[Date.now(), null]],
        showInLegend: false,
        enableMouseTracking: false,
      } as SeriesLineOptions];

  const options: Options = {
    chart: {
      renderTo: chartContainer,
      type: 'line',
      zoomType: 'x',
      panning: {
        enabled: true,
        type: 'x',
      },
      panKey: 'shift', // Optional: Hold 'Shift' to pan
      // Removed scrollablePlotArea to prevent horizontal overflow
    },
    title: {
      text: props.title,
      align: 'center',
    },
    xAxis: {
      type: 'datetime',
      tickInterval: calculatedTickInterval,
      labels: {
        format: '{value:%e %b %H:%M}',
        rotation: calculatedTickInterval < 60 * 60 * 1000 ? -45 : 0,
        align: calculatedTickInterval < 60 * 60 * 1000 ? 'right' : 'center',
        style: {
          fontSize: '10px',
          whiteSpace: 'nowrap',
        },
      },
      title: {
        text: '',
      },
      // Removed scrollbar configuration
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        format: '{value}',
      },
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
    },
    tooltip: {
      shared: true,
      xDateFormat: '%e %b %Y %H:%M',
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          radius: 0,
        },
        dataLabels: {
          enabled: false,
        },
      },
      series: {
        turboThreshold: 0,
      },
    },
    series: chartSeries,
    responsive: {
      rules: [
        {
          condition: { maxWidth: 600 },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom',
            },
            xAxis: {
              labels: {
                rotation: -45,
                align: 'right',
              },
            },
          },
        },
      ],
    },
  };

  chartInstance = Highcharts.chart(options);
};

// Function to update the chart
const updateChart = () => {
  if (!chartInstance) return;
  const calculatedTickInterval = calculateTickInterval();
  chartInstance.update({
    xAxis: {
      tickInterval: calculatedTickInterval,
      labels: {
        rotation: calculatedTickInterval < 60 * 60 * 1000 ? -45 : 0,
        align: calculatedTickInterval < 60 * 60 * 1000 ? 'right' : 'center',
      },
    },
    series: props.data.series.map(seriesData => ({
      ...seriesData,
      data: seriesData.data || [],
    })),
  }, false);

  chartInstance.redraw();
};

watchEffect(() => {
  if (props.data.categories.length && props.data.series.length) {
    nextTick(() => {
      if (!chartInstance) {
        createChart();
      } else {
        updateChart();
      }
    });
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* Prevent CSS horizontal overflow */
  box-sizing: border-box;
}
</style>
