<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useSmokeStore } from '@/stores/smoke';
import { storeToRefs } from 'pinia';
import Table from '@/components/Table.vue';
import CChart from '@/components/donut.vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import DowntimeChart from '@/components/DowntimeChart.vue';
import { useTimezone } from '@/composables/useTimezone';
import { SmokeData, DataItem, RatioData } from '@/types/types';

dayjs.extend(utc);
dayjs.extend(timezone);
const BANGKOK_TZ = 'Asia/Bangkok';

const { timezone: userTimezone } = useTimezone();
const smokeStore = useSmokeStore();
const { todayCount, smokeStatus, percentageBlack, selectedSmoke } = storeToRefs(smokeStore);

const tabBar = ref<'Graph' | 'Table'>('Graph');
const setTab = (tabName: 'Graph' | 'Table') => {
  tabBar.value = tabName;
};

const selectedPeriod = ref<string>('1h');
const startDate = ref<string>(dayjs().tz(userTimezone.value).subtract(1, 'hour').format('YYYY-MM-DDTHH:mm'));
const endDate = ref<string>(dayjs().tz(userTimezone.value).format('YYYY-MM-DDTHH:mm'));

const chartStartDate = ref<string>(startDate.value);
const chartEndDate = ref<string>(endDate.value);

const formatDate = (dateTimeStr: string): string => {
  return dayjs(dateTimeStr).tz(BANGKOK_TZ).format('DD/MM/YYYY HH:mm:ss');
};

const filteredData = computed<SmokeData[]>(() => smokeStore.filteredData);
const totalRecords = computed(() => smokeStore.totalRecords);
const longestSmokeEvent = computed<SmokeData | null>(() => smokeStore.longestSmokeEvent);
const totalSmokeTime = computed(() => smokeStore.totalSmokeTime);
const smokeTimePercentage = computed(() => smokeStore.smokeTimePercentage);

const smokeMinutes = computed<number>(() => {
  if (selectedSmoke.value && selectedSmoke.value.TimeOfSmoke) {
    const parts = selectedSmoke.value.TimeOfSmoke.split(':');
    return parts.length >= 2 ? parseInt(parts[1], 10) || 0 : 0;
  }
  return 0;
});
const smokeSeconds = computed<number>(() => {
  if (selectedSmoke.value?.TimeOfSmoke && isValidTimeFormat(selectedSmoke.value.TimeOfSmoke)) {
    const parts = selectedSmoke.value.TimeOfSmoke.split(':');
    return parseInt(parts[2], 10) || 0;
  }
  return 0;
});

const tableData = computed<DataItem[]>(() => {
  return filteredData.value.map((item) => ({
    No: item.No || 0,
    StartTime: item.StartTime,
    EndTime: item.EndTime,
    TimeOfSmoke: item.TimeOfSmoke,
  }));
});

const todayRatioData = ref<RatioData>({
  data: [
    { name: 'Black Smoke', y: 0, color: '#FF0000' },
    { name: 'White Smoke', y: 0, color: '#22c55e' },
  ],
  unit: 'Ratio',
  chartSize: '60',
  credits: false,
});

const updateRatioData = () => {
  const blackPercentage = parseFloat(percentageBlack.value?.replace('%', '') || '0');
  const whitePercentage = 100 - blackPercentage;

  todayRatioData.value.data = [
    { name: 'Black Smoke', y: blackPercentage, color: '#FF0000' },
    { name: 'White Smoke', y: whitePercentage, color: '#22c55e' },
  ];
};

const fetchRealtime = async () => {
  await smokeStore.loadSmoke();
  updateRatioData();
};


const setPeriod = (period: string) => {
  const now = dayjs().tz(userTimezone.value);
  let start: dayjs.Dayjs;

  selectedPeriod.value = period;

  switch (period) {
    case '1h':
      start = now.subtract(1, 'hour');
      break;
    case '24h':
      start = now.subtract(24, 'hour');
      break;
    case '7d':
      start = now.subtract(7, 'day');
      break;
    case '30d':
      start = now.subtract(30, 'day');
      break;
    default:
      start = now.subtract(1, 'hour');
  }

  startDate.value = start.format('YYYY-MM-DDTHH:mm');
  endDate.value = now.format('YYYY-MM-DDTHH:mm');

  fetchFilterData();
};

const fetchFilterData = async () => {
  try {
    // if (
    //   selectedPeriod.value !== '1h' &&
    //   selectedPeriod.value !== '24h' &&
    //   selectedPeriod.value !== '7d' &&
    //   selectedPeriod.value !== '30d'
    // ) {
    //   if (intervalId) {
    //     clearInterval(intervalId);
    //     intervalId = null;
    //   }
    //   selectedPeriod.value = '';
    // }

    const start = dayjs(startDate.value).tz(userTimezone.value);
    const end = dayjs(endDate.value).tz(userTimezone.value);

    if (start.isAfter(end)) {
      alert('Start date-time must be before End date-time.');
      return;
    }

    const startDateUTC = start.utc().toISOString();
    const endDateUTC = end.utc().toISOString();

    await smokeStore.filterSmoke(startDateUTC, endDateUTC);

    chartStartDate.value = startDate.value;
    chartEndDate.value = endDate.value;

    updateRatioData();
  } catch (error) {
    console.error('Error in fetchFilterData:', error);
    alert('Failed to fetch filtered data. Please try again later.');
  }
};

const checkStatus = () => {
  const latest = smokeStatus.value;
  if (latest === undefined || latest === null) {
    return { status: 'bg-green-500 text-white' };
  }

  const statusClass = latest === 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
  return { status: statusClass };
};

const status = computed(() => checkStatus());

const formatDateTime = (dateTime: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: userTimezone.value,
  };
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat('en-GB', options).format(date).replace(',', '');
};

const convertToCSV = (data: DataItem[]): string => {
  if (!data.length) {
    return '';
  }

  const headers = ['No', 'Start Time', 'End Time', 'TimeOfSmoke'];
  const csvRows = [
    headers.join(','), // Headers without `Status`
    ...data.map((row, index) =>
      [
        `"${index + 1}"`, // Dynamic No based on index
        `"${formatDateTime(row.StartTime)}"`,
        `"${formatDateTime(row.EndTime)}"`,
        `"${row.TimeOfSmoke}"`,
      ].join(',')
    ),
  ];

  return csvRows.join('\n');
};

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const exportToCSV = () => {
  const csv = convertToCSV(tableData.value);
  if (!csv) {
    alert('No data available to export.');
    return;
  }
  downloadCSV(csv, 'black_smoke_data.csv');
};

onMounted(() => {
  setPeriod('1h');
  fetchRealtime();
});

setInterval(() => {
    console.log('====================================');
    console.log("dsad");
    console.log('====================================');
    if(selectedPeriod.value=='1h'){
      setPeriod('1h');
    }
    fetchRealtime();
  }, 10000);





watch(filteredData, updateRatioData);

function isValidTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}:\d{2}$/.test(time);
}

const formattedFilteredData = computed(() => {
  const data = [];
  const start = dayjs(chartStartDate.value).tz(userTimezone.value).valueOf();
  const end = dayjs(chartEndDate.value).tz(userTimezone.value).valueOf();

  const events = filteredData.value
    .map((item) => ({
      x: dayjs(item.StartTime).tz(userTimezone.value).valueOf(),
      x2: dayjs(item.EndTime).tz(userTimezone.value).valueOf(),
      y: 0,
      data: 'Black',
      color: item.color || '#FF0000',
    }))
    .sort((a, b) => a.x - b.x);

  let lastTime = start;

  for (const event of events) {
    if (event.x > lastTime) {
      data.push({
        x: lastTime,
        x2: event.x,
        y: 0,
        data: 'White',
        color: '#22c55e',
      });
    }
    data.push(event);
    lastTime = event.x2;
  }

  if (lastTime < end) {
    data.push({
      x: lastTime,
      x2: end,
      y: 0,
      data: 'White',
      color: '#22c55e',
    });
  }

  return data;
});

const chartColors = ref({
  background: '#F3f4f6',
  font: '',
});
</script>


<template>
  <div class="h-full flex flex-col p-4 relative">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">Dashboard</h1>
    </header>

    <section class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4">
        <div class="rounded-lg shadow-md overflow-hidden max-h-80 h-80 w-full flex">
          <img v-if="selectedSmoke && selectedSmoke.imageUrl && selectedSmoke.imageUrl.length > 0"
            :src="selectedSmoke.imageUrl" class="object-fit w-full h-full" alt="Smoke Event Image" />
          <div v-else class="flex items-center justify-center w-full h-full bg-gray-200">
            <span>No Image Available</span>
          </div>
        </div>

        <div class="grid grid-rows-2 gap-4 max-h-80 h-80">
          <div :class="['rounded-lg flex items-center justify-center p-4 shadow-md h-full', status.status]">
            <h2 class="text-2xl font-bold tracking-wide text-center">
              {{ smokeStatus === 0 ? 'WHITE SMOKE' : 'BLACK SMOKE' }}
            </h2>
          </div>
          <div class="bg-white rounded-lg p-4 shadow-md flex flex-col items-center justify-center text-center h-full">
            <h2 class="text-gray-700 font-medium text-lg mb-1">Duration of Black Smoke</h2>
            <p class="font-medium text-gray-500 mb-1">(Current)</p>
            <div class="flex justify-center items-center space-x-4">
              <div class="bg-gray-50 rounded-lg p-3 shadow-sm flex flex-col items-center">
                <p class="text-xl font-bold text-gray-800"> {{ smokeStatus === 0 ? '-' : smokeMinutes }}</p>
                <p class="text-sm text-gray-500">Minutes</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 shadow-sm flex flex-col items-center">
                <p class="text-xl font-bold text-gray-800">{{ smokeStatus === 0 ? '-' : smokeSeconds }}</p>
                <p class="text-sm text-gray-500">Seconds</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-rows-2 gap-4 max-h-80 h-80">
          <div class="bg-white rounded-lg p-4 shadow-md flex flex-col items-center justify-center h-full">
            <h2 class="text-gray-700 font-semibold text-lg mb-1">Count of Black Smoke</h2>
            <p class="font-medium text-gray-500 mb-1">(Today)</p>
            <div class="flex flex-col items-center">
              <p class="text-2xl font-bold text-gray-800 mt-2">{{ todayCount }}</p>
              <span class="text-sm font-bold text-gray-500">times</span>
            </div>
          </div>
          <div class="bg-white rounded-lg p-4 shadow-md flex flex-col items-center justify-center h-full">
            <h2 class="text-gray-700 font-medium text-lg">Today Ratio</h2>
            <div class="w-full h-full flex items-center justify-center">
              <CChart :dataSource="todayRatioData" class="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <hr class="my-3">

    <!-- Filter Data Section -->
    <section>
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Filter Data</h2>
      <div class="mb-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div class="flex bg-gray-100 rounded-lg overflow-hidden shadow-sm">
          <button @click="setTab('Graph')" :class="[
            'px-5 py-2 text-sm font-medium focus:outline-none transition-colors duration-150',
            tabBar === 'Graph' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200',
          ]">
            Graph
          </button>
          <button @click="setTab('Table')" :class="[
            'px-5 py-2 text-sm font-medium focus:outline-none transition-colors duration-150',
            tabBar === 'Table' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200',
          ]">
            Table
          </button>
        </div>

        <div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <div class="flex flex-wrap items-center space-x-2">
            <span class="text-gray-600 font-medium mr-2">Period:</span>
            <button @click="setPeriod('1h')" :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none',
              selectedPeriod === '1h'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
            ]">
              1 Hour
            </button>
            <button @click="setPeriod('24h')" :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none',
              selectedPeriod === '24h'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
            ]">
              24 Hours
            </button>
            <button @click="setPeriod('7d')" :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none',
              selectedPeriod === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
            ]">
              7 Days
            </button>
            <button @click="setPeriod('30d')" :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none',
              selectedPeriod === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
            ]">
              30 Days
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <input type="datetime-local"
              class="bg-white border border-gray-300 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              v-model="startDate" />
            <span class="text-gray-500">to</span>
            <input type="datetime-local"
              class="bg-white border border-gray-300 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              v-model="endDate" />
            <button @click="fetchFilterData"
              class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-150 focus:outline-none">
              Search
            </button>
          </div>
        </div>
      </div>

      <!-- Graph or Table Content -->
      <div>

        <div v-if="tabBar === 'Graph'" class="bg-white rounded-lg my-4 overflow-hidden">
          <div v-if="totalRecords">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

              <div
                class="bg-gray-100 border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center">
                <h3 class="text-sm font-medium text-gray-600 mb-2">Count of Black Smoke</h3>
                <p class="text-xl sm:text-2xl font-bold text-gray-800">{{ totalRecords || 'No Data' }}</p>
              </div>

              <div class="bg-gray-100 border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-600 text-center mb-3">Longest Duration</h3>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">Start Time:</span>
                      <span class="text-sm font-medium">{{ formatDate(longestSmokeEvent.StartTime) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">End Time:</span>
                      <span class="text-sm font-medium">{{ formatDate(longestSmokeEvent.EndTime) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">Total Duration:</span>
                      <span class="text-sm font-medium">{{ longestSmokeEvent.TimeOfSmoke }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="bg-gray-100 border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center">
                <h3 class="text-sm font-medium text-gray-600 mb-2">Total Black Smoke Time</h3>
                <p class="text-xl sm:text-2xl font-bold text-gray-800">{{ totalSmokeTime || 'No Data' }}</p>
              </div>

              <div
                class="bg-gray-100 border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center">
                <h3 class="text-sm font-medium text-gray-600 mb-2">Black Smoke Percentage</h3>
                <p class="text-xl sm:text-2xl font-bold text-gray-800">{{ smokeTimePercentage || 'No Data' }}</p>
              </div>
            </div>


            <div class="bg-gray-100 border-gray-200 rounded-lg p-5 shadow-sm">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Downtime Chart</h3>
              <div class="flex items-center justify-center">
                <DowntimeChart :filteredData="formattedFilteredData" :color="chartColors" class="w-full h-full" />
              </div>
            </div>
          </div>
          <div v-else class="h-40 flex my-4 justify-center items-center">
            <p class="text-center text-gray-500">No Data</p>
          </div>
        </div>

        <!-- Table Tab -->
        <div v-if="tabBar === 'Table'" class="my-4 overflow-x-auto">
          <div class="flex items-center justify-between p-4 border-b">
            <h2 class="text-gray-700 font-medium text-lg">Black Smoke Data</h2>
            <button @click="exportToCSV"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
              Export Data
            </button>
          </div>
          <div>
            <Table v-if="tableData.length > 0" :data="tableData.reverse()" />
            <div v-else class="h-40 flex justify-center items-center my-4">
              <p class="text-center text-gray-500">No Data</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}
</style>
