import { createRouter, createWebHistory } from 'vue-router';

import IntroPage from '@/pages/IntroPage.vue';
import AboutPage from '@/pages/AboutPage.vue';
import DevicesPage from '@/pages/DevicesPage.vue';

const routes = [
  {
    path: '/',
    name: 'intro',
    component: IntroPage,
    meta: { label: '简介' },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage,
    meta: { label: '关于' },
  },
  {
    path: '/devices',
    name: 'devices',
    component: DevicesPage,
    meta: { label: '设备' },
  },
];

export const navRoutes = routes.map((route) => ({
  name: route.name,
  path: route.path,
  label: route.meta.label,
}));

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
