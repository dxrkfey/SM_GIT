<template>
  <div class="flex flex-col items-center">
    <highcharts :options="chartOptions" class="chart-container"></highcharts>
    <div class="flex items-center space-x-4 mt-2">
      <p class="font-semibold">Status : </p>
      <div class="flex space-x-3">
        <div v-for="(item, index) in uniqueStatusItems" :key="index" class="flex items-center space-x-2">
          <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
          <span class="text-sm font-medium text-gray-700">{{ item.data }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, watch, reactive, computed } from 'vue';
import Highcharts from 'highcharts';
import xrange from 'highcharts/modules/xrange';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

xrange(Highcharts);
dayjs.extend(utc);
dayjs.extend(timezone);

Highcharts.setOptions({
  time: {
    timezone: 'Asia/Bangkok',
  },
});

export default defineComponent({
  name: 'DowntimeChart',
  props: {
    filteredData: {
      type: Array as () => Array<{
        x: number;
        x2: number;
        y: number;
        data: string;
        color: string;
      }>,
      default: () => [],
    },
    color: {
      type: Object as () => {
        background: string;
        font: string;
      },
      default: () => ({
        background: '#FFFFFF',
        font: '#198754',
      }),
      required: false,
    },
  },
  setup(props) {
    const chartOptions = reactive({
      chart: {
        type: 'xrange',
        height: 200,
        backgroundColor: props.color.background,
        borderRadius: 8,
        spacing: [0, 0, 0, 0],
        zoomType: 'x',
        panning: {
          enabled: true,
          type: 'x',
        },
        panKey: 'shift',
        resetZoomButton: {
          position: {
            align: 'right',
            verticalAlign: 'top',
            x: -10,
            y: 10,
          },
          theme: {
            fill: '#f7f7f7',
            stroke: 'silver',
            r: 0,
            states: {
              hover: {
                fill: '#e6e6e6',
                style: {
                  color: '#333',
                },
              },
            },
          },
        },
      },
      title: {
        text: null,
      },
      xAxis: {
        type: 'datetime',
        labels: {
          format: '{value:%d/%m %H:%M}',
          style: {
            color: props.color.font,
            fontSize: '12px',
          },
        },
        gridLineWidth: 0,
        lineWidth: 0,
        tickWidth: 0,
        startOnTick: false,
        endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
        dateTimeLabelFormats: {
          hour: '%d/%m %H:%M',
          day: '%d/%m %H:%M',
        },
      },
      yAxis: {
        title: {
          text: null,
        },
        categories: [],
        reversed: true,
        min: 0,
        max: 0,
        tickWidth: 0,
        lineWidth: 0,
        labels: {
          enabled: false,
        },
        gridLineWidth: 0,
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd',
        borderRadius: 4,
        borderWidth: 1,
        shadow: false,
        style: {
          color: '#333',
          fontSize: '13px',
        },
        pointFormat: `
          <span style="color:{point.color}">\u25CF</span> 
          <b>{point.data}</b>: {point.x:%d/%m/%Y %H:%M:%S} - {point.x2:%d/%m/%Y %H:%M:%S}
        `,
      },
      plotOptions: {
        series: {
          pointPadding: 0,
          groupPadding: 0,
          borderWidth: 0,
          borderColor: '#ffffff',
          states: {
            hover: {
              enabled: true,
              brightness: 0.2,
            },
          },
        },
        xrange: {
          dataLabels: {
            enabled: false,
          },
        },
      },
      series: [
        {
          name: 'Smoke Events',
          data: props.filteredData,
        },
      ],
      credits: {
        enabled: false,
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 800,
            },
            chartOptions: {
              yAxis: {
                labels: {
                  style: {
                    fontSize: '12px',
                  },
                },
              },
              xAxis: {
                labels: {
                  style: {
                    fontSize: '10px',
                  },
                },
              },
            },
          },
        ],
      },
    });

    watch(
      [() => props.filteredData, () => props.color],
      ([newData, newColor]) => {
        chartOptions.series[0].data = newData;
        chartOptions.chart.backgroundColor = newColor.background;
        chartOptions.xAxis.labels.style.color = newColor.font;
      },
      { immediate: true, deep: true }
    );

    const uniqueStatusItems = computed(() => {
      const uniqueItems = new Map();
      props.filteredData.forEach((item) => {
        if (!uniqueItems.has(item.data)) {
          uniqueItems.set(item.data, item.color);
        }
      });
      return Array.from(uniqueItems, ([data, color]) => ({ data, color }));
    });

    return {
      chartOptions,
      uniqueStatusItems,
    };
  },
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
