<template>
  <div class="max-h-80 overflow-y-auto rounded-lg shadow-md">
    <table class="w-full border-collapse text-center">
      <thead class="sticky top-0 bg-gray-200 z-10">
        <tr>
          <th class="border px-4 py-3">No</th>
          <th class="border px-4 py-3">Start Time</th>
          <th class="border px-4 py-3">End Time</th>
          <th class="border px-4 py-3">Time of Smoke</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in data"
          :key="item.No"
          class="bg-white hover:bg-gray-100 transition-colors duration-200"
        >
          <td class="border px-4 py-2 text-sm text-gray-700">{{ index+1 }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ formatDateTime(item.StartTime) }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ formatDateTime(item.EndTime) }}</td>
          <td class="border px-4 py-2 text-sm text-gray-700">{{ formatDuration(item.TimeOfSmoke) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { DataItem } from '@/types/types'; 

const props = defineProps<{
  data: DataItem[];
}>();

const formatDateTime = (dateTime: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok',
  };
  const date = new Date(dateTime);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const formattedDateTime = new Intl.DateTimeFormat('en-GB', options).format(date);
  return formattedDateTime.replace(',', '');
};

const formatDuration = (duration: string): string => {
  const [hours, minutes, seconds] = duration.split(':').map(Number);
  let formatted = '';
  
  if (hours > 0) {
    formatted += `${hours} hr${hours > 1 ? 's' : ''} `;
  }
  if (minutes > 0) {
    formatted += `${minutes} min${minutes > 1 ? 's' : ''} `;
  }
  if (seconds > 0 && hours === 0) { // Only show seconds if less than an hour
    formatted += `${seconds} sec${seconds > 1 ? 's' : ''}`;
  }
  
  return formatted.trim() || '0 sec';
};
</script>

<style scoped>
.max-h-64 {
  max-height: 16rem; /* 256px */
}
table {
  border-collapse: collapse;
}
th, td {
  border: 1px solid #e2e8f0; /* Tailwind's gray-200 */
}
th {
  background-color: #edf2f7; /* Tailwind's gray-200 */
}
</style>
