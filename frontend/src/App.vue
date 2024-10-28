<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';

const route = useRoute();
const isMobile = ref(false);

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

const showSidebar = computed(() => route.path !== '/login');
</script>

<template>
  <div class="app-container">
    <Sidebar v-if="showSidebar" :is-mobile="isMobile" class="sidebar" />
    <div class="main-content" :class="{ 'mt-0': isMobile }">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  position: relative; 
}

.sidebar {
  position: sticky;
  top: 0;
  flex-shrink: 0;
  z-index: 10;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
  z-index: 1; 
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
}
</style>
