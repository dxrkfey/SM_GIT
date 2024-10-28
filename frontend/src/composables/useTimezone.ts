// src/composables/useTimezone.ts
import { ref } from 'vue';

export function useTimezone() {
  const timezone = ref<string>('Asia/Bangkok'); // Fixed timezone

  return { timezone };
}
