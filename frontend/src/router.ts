import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Setting from './views/Setting.vue';
import Login from './views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
