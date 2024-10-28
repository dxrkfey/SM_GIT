<script setup>
import { ref, watch, onMounted, defineProps, toRefs } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import QonnectFull from '@/assets/QonnectFull.vue';
import ArrowCollapse from '@/assets/ArrowCollapse.vue';
import HomeLine from '@/assets/Home/HomeIconLine.vue';
import HomeFill from '@/assets/Home/HomeIconFill.vue';
import SettingLine from '@/assets/Setting/SettingIconLine.vue';
import SettingFill from '@/assets/Setting/SettingIconFill.vue';
import LogoutIcon from '@/assets/LogoutIcon.vue';

const props = defineProps({
  isMobile: Boolean,
});

const { isMobile } = toRefs(props);

const open = ref(localStorage.getItem('sidebar_open') !== 'false');
const selectedMenuItem = ref('Home');
const showMobileMenu = ref(false);
const router = useRouter();
const route = useRoute();

const menuItems = [
  {
    name: 'Home',
    path: '/',
    iconLine: HomeLine,
    iconFill: HomeFill,
  },
  {
    name: 'Setting',
    path: '/setting',
    iconLine: SettingLine,
    iconFill: SettingFill,
  },
  {
    name: 'Logout',
    path: '/login',
    iconLine: LogoutIcon,
    iconFill: LogoutIcon,
  },
];


const navigate = (path) => {
  router.push(path);
  if (isMobile.value) showMobileMenu.value = false;
};

watch(
  () => route.path,
  (newPath) => {
    const menuItem = menuItems.find((item) => item.path === newPath);
    selectedMenuItem.value = menuItem ? menuItem.name : 'Devices';
  },
  { immediate: true }
);

onMounted(() => {
  const menuItem = menuItems.find((item) => item.path === route.path);
  selectedMenuItem.value = menuItem ? menuItem.name : 'Devices';
});

const collapse = () => {
  open.value = !open.value;
  localStorage.setItem('sidebar_open', open.value);
};
</script>

<template>
  <div>
    <!-- Mobile Navbar -->
    <div v-if="isMobile" class="bg-[#242A2D] p-4 flex items-center justify-between w-full z-9999 relative">
      <QonnectFull class="h-6" />
      <button @click="showMobileMenu = !showMobileMenu" class="text-white">
        <svg xmlns="http://www.w3.org/2000/svg" :class="{ 'rotate-180': showMobileMenu }"
          class="h-6 w-6 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 6h16M4 12h16m-7 6h7" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="fade">
      <div v-if="isMobile && showMobileMenu" class="fixed inset-0  z-9999">
        <div class="absolute inset-0 bg-black opacity-50" @click="showMobileMenu = false"></div>
        <div
          class="z-50 absolute top-0 right-0 w-64 h-full bg-[#242A2D] text-white shadow-lg transform transition-transform duration-300"
          :class="{ 'translate-x-0': showMobileMenu, 'translate-x-full': !showMobileMenu }">
          <div class="p-4 flex items-center justify-between border-b border-gray-700">
            <p>Menu</p>
            <button @click="showMobileMenu = false" class="text-white focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Menu Items -->
          <div class="mt-2">
            <div v-for="item in menuItems" :key="item.name"
              class="px-4 py-3 cursor-pointer hover:bg-gray-700 flex items-center" @click="navigate(item.path)">
              <component :is="selectedMenuItem === item.name ? item.iconFill : item.iconLine" class="mr-3 w-5 h-5" />
              <span class="text-sm font-medium">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Desktop Sidebar -->
    <div v-if="!isMobile"
      :class="[open ? 'w-[200px]' : 'w-20', 'bg-[#242A2D]', 'h-screen', 'p-4', 'pt-8', 'duration-300', 'rounded-r-[15px]', 'transition-all', 'z-40']">
      <div class="inline-flex items-center">
        <QonnectFull class="mr-1" />
        <h1
          :class="['text-white origin-left font-medium text-2xl transition-all', { 'opacity-0 w-0': !open, 'opacity-100 w-auto': open }]">
          onnect
        </h1>
      </div>

      <div class="mt-8">
        <div v-for="item in menuItems" :key="item.name"
          :class="['flex items-center my-4 cursor-pointer', selectedMenuItem === item.name ? 'text-white' : 'text-gray-400', 'hover:text-white']"
          @click="navigate(item.path)">
          <div class="w-6 h-6 ml-2 flex-shrink-0">
            <component :is="selectedMenuItem === item.name ? item.iconFill : item.iconLine" />
          </div>
          <span class="ml-2 text-lg font-medium transition-all duration-300"
            :class="{ 'opacity-0 w-0': !open, 'opacity-100 w-auto': open }">
            {{ item.name }}
          </span>
          <div v-if="selectedMenuItem === item.name" class="absolute right-0 w-1.5 h-8 bg-white rounded-l-sm"></div>
        </div>
      </div>

      <div
        :class="['bg-white w-8 h-8 rounded-full mx-auto cursor-pointer absolute bottom-10 left-1/2 transform -translate-x-1/2', open ? '' : 'rotate-180', 'transition-transform duration-300']"
        @click="collapse">
        <ArrowCollapse />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .fixed,
.fade-leave-active .fixed {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>