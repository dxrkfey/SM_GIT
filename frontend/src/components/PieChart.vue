<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue';
import Highcharts, { Chart, Options, SeriesPieOptions } from 'highcharts';

// Define the interface for the data prop
interface ChartDataItem {
  name: string;
  y: number;
  percentage: number;
}

const props = defineProps<{
  data: ChartDataItem[];
}>();

const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: Chart | null = null;

const createChart = () => {
  if (!chartContainer.value) {
    console.error('Chart container not found');
    return;
  }

  const options: Options = {
    chart: {
      type: 'pie',
      renderTo: chartContainer.value,
      backgroundColor: 'transparent', // Optional: make the chart background transparent
    },
    title: {
      text: '',
    },
    tooltip: {
      headerFormat: '<span style="font-size:18px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                   '<td style="padding:0; font-size: 16px"><b>{point.percentage:.1f}%</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        innerSize: '0%', // Change to '50%' for a donut chart
        dataLabels: {
          enabled: true,
          // Display both y and percentage
          format: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)',
          style: {
            fontSize: '12px',
            color: '#333',
          },
        },
        showInLegend: false, // Set to true if you want to display legends
        shadow: {
          color: '#ccc',
          width: 2,
          opacity: 0.8,
        },
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Percentage',
        colorByPoint: true,
        data: props.data,
        colors: ['#C7253E', '#41B3A2'], 
        showInLegend: false, // Optional: hide legend
      } as SeriesPieOptions,
    ],
    credits: {
      enabled: false, 
    },
    exporting: {
      enabled: false, // Optional: disable exporting
    },
  };

  chartInstance = Highcharts.chart(options);
};

onMounted(() => {
  createChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

watch(
  () => props.data,
  (newData) => {
    if (chartInstance && newData) {
      chartInstance.series[0].setData(newData, true);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px; /* Adjust height as needed */
}
</style>
