import { createRouter, createWebHistory } from 'vue-router';

import IntroPage from '@/pages/IntroPage.vue';
import AboutPage from '@/pages/AboutPage.vue';
import DevicesPage from '@/pages/DevicesPage.vue';
import FriendlinkPage from '@/pages/FriendlinkPage.vue';
import GuestbookPage from '@/pages/GuestbookPage.vue';

const routes = [
  {
    path: '/',
    name: 'intro',
    component: IntroPage,
    meta: { label: '简介', icon: 'person' },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage,
    meta: { label: '关于', icon: 'info' },
  },
  {
    path: '/devices',
    name: 'devices',
    component: DevicesPage,
    meta: { label: '设备', icon: 'devices' },
  },
  {
    path: '/friendlink',
    name: 'friendlink',
    component: FriendlinkPage,
    meta: { label: '朋友', icon: 'group' },
  },
  {
    path: '/guestbook',
    name: 'guestbook',
    component: GuestbookPage,
    meta: { label: '留言', icon: 'chat_bubble', requiresOversea: true },
  },
];

export const navRoutes = routes.map((route) => ({
  name: route.name,
  path: route.path,
  label: route.meta.label,
  icon: route.meta.icon,
  requiresOversea: Boolean(route.meta.requiresOversea),
}));

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
