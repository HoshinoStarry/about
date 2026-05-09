<script setup>
import { computed, ref, onBeforeUnmount, onMounted, watch } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

import avatarImage from './assets/avatar.png';
import wechatQrCode from './assets/wechat_mp_qrcode.jpg';

import IconGithub from './components/icons/Github.vue';
import IconBilibili from './components/icons/Bilibili.vue';
import IconTelegram from './components/icons/Telegram.vue';
import IconX from './components/icons/X.vue';
import IconWeChat from './components/icons/WeChat.vue';
import IconEmail from '@/components/icons/Email.vue';
import { navRoutes } from '@/router';

const name = ref('HoshinoStarry');
const bio = ref('技术折腾人 / 可能是二次元 / 消费电子收藏与实验');
const siteIcp = ref('浙ICP备2025208590号-1');

const tabItems = navRoutes;

const socialLinks = ref([
  { name: 'Email', url: 'mailto:admin@hoshino.host', icon: IconEmail },
  { name: 'Bilibili', url: 'https://space.bilibili.com/179663677', icon: IconBilibili },
  { name: 'WeChat', url: '', icon: IconWeChat },
]);

const formatClassName = (value) => value
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const socialButtonClass = (social) => `social-button-${formatClassName(social.name)}`;

const overseaSocialLinks = ref([
  { name: 'GitHub', url: 'https://github.com/HoshinoStarry', icon: IconGithub },
  { name: 'Telegram', url: 'https://t.me/HoshinoStarry', icon: IconTelegram },
  { name: 'X(Twitter)', url: 'https://twitter.com/HoshinoStarry', icon: IconX },
]);

const nowYear = ref(new Date().getFullYear());
const userIpInfo = ref({});
const isGeoResolved = ref(false);
const shouldShowOverseaContent = computed(() => isGeoResolved.value && userIpInfo.value.country_code !== 'CN');
const isWechatDialogOpen = ref(false);

const themeMode = ref(null);
const systemDark = ref(false);
const resolvedTheme = computed(() => themeMode.value ?? (systemDark.value ? 'dark' : 'light'));
const themeLabel = computed(() => resolvedTheme.value === 'dark' ? '深色' : '浅色');
let mediaQuery;

const applyTheme = () => {
  document.documentElement.dataset.theme = resolvedTheme.value;
  document.documentElement.style.colorScheme = resolvedTheme.value;
};

const cycleTheme = () => {
  const nextTheme = resolvedTheme.value === 'dark' ? 'light' : 'dark';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (document.startViewTransition && !reduceMotion) {
    document.startViewTransition(() => {
      themeMode.value = nextTheme;
      applyTheme();
    });
    return;
  }

  themeMode.value = nextTheme;
};

const fetchUserLocationAndSocialLinks = async () => {
  try {
    const api = 'https://api.ip.sb/geoip';
    userIpInfo.value = await (await fetch(api)).json();
    isGeoResolved.value = true;

    if (shouldShowOverseaContent.value) {
      socialLinks.value = [...socialLinks.value, ...overseaSocialLinks.value];
    }
  } catch (error) {
    isGeoResolved.value = false;
    console.error('获取用户地理位置信息失败:', error);
  }
};

const showWechatDialog = () => {
  isWechatDialogOpen.value = true;
};

const closeWechatDialog = () => {
  isWechatDialogOpen.value = false;
};

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemDark.value = mediaQuery.matches;

  const syncSystemTheme = (event) => {
    systemDark.value = event.matches;
  };

  mediaQuery.addEventListener('change', syncSystemTheme);
  mediaQuery._personalIntroSync = syncSystemTheme;
  applyTheme();
  fetchUserLocationAndSocialLinks();
});

onBeforeUnmount(() => {
  if (mediaQuery?._personalIntroSync) {
    mediaQuery.removeEventListener('change', mediaQuery._personalIntroSync);
  }
});

watch([themeMode, systemDark], () => {
  applyTheme();
});
</script>

<template>
  <div class="layout">
    <div class="container">
      <header class="hero">
        <div class="hero-main">
          <img :src="avatarImage" alt="个人头像" class="profile-image" />
          <div class="hero-copy">
            <p class="hero-kicker">Personal site</p>
            <h1>{{ name }}</h1>
            <p class="hero-bio">{{ bio }}</p>
          </div>
        </div>

        <div class="social-links">
          <template v-for="(social, index) in socialLinks" :key="index">
            <button
                v-if="social.name === 'WeChat'"
                type="button"
                :class="['social-button', socialButtonClass(social)]"
                @click="showWechatDialog"
            >
              <span class="social-icon-wrap" aria-hidden="true">
                <component :is="social.icon" />
              </span>
              <span class="social-label">{{ social.name }}</span>
            </button>
            <a
                v-else
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                :class="['social-button', socialButtonClass(social)]"
            >
              <span class="social-icon-wrap" aria-hidden="true">
                <component :is="social.icon" />
              </span>
              <span class="social-label">{{ social.name }}</span>
            </a>
          </template>
        </div>

        <div class="hero-meta">
          <nav class="nav-shell" aria-label="内容分页">
            <RouterLink
              v-for="item in tabItems"
              :key="item.name"
              class="tab-button"
              active-class="is-active"
              :to="item.path"
            >
              {{ item.label }}
            </RouterLink>
          </nav>

          <button class="theme-toggle" type="button" :aria-label="`切换主题，当前为${themeLabel}`" :title="themeLabel" @click="cycleTheme">
            <svg v-if="resolvedTheme === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <path d="m12 2.25 2.76 6.2 6.74.71-5.03 4.55 1.4 6.64L12 16.96l-5.87 3.39 1.4-6.64L2.5 9.16l6.74-.71L12 2.25Z" />
            </svg>
          </button>
        </div>
      </header>

      <main class="main-content">
        <RouterView v-slot="{ Component, route }">
          <Transition name="tab-panel" mode="out-in" appear>
            <section :key="route.fullPath" class="page-section">
              <component :is="Component" :show-github-stats="shouldShowOverseaContent" />
            </section>
          </Transition>
        </RouterView>
      </main>

      <footer class="footer">
        <p>&copy; {{ nowYear }} HoshinoStarry</p>
        <p v-if="userIpInfo.ip">您的IP地址: {{ userIpInfo.ip }} ({{ userIpInfo.country }})</p>
        <p class="icp-info">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">{{ siteIcp }}</a>
        </p>
      </footer>
    </div>

    <Transition name="wechat-dialog-fade">
      <div v-if="isWechatDialogOpen" class="wechat-dialog-layer" role="presentation" @click.self="closeWechatDialog">
        <section class="wechat-dialog" role="dialog" aria-modal="true" aria-labelledby="wechat-dialog-title">
          <button class="wechat-dialog-x" type="button" aria-label="关闭微信公众号弹窗" @click="closeWechatDialog">×</button>
          <p class="dialog-eyebrow">WeChat</p>
          <h2 id="wechat-dialog-title" class="wechat-dialog-title">微信公众号</h2>
          <div class="wechat-qr-shell">
            <img :src="wechatQrCode" alt="微信公众号二维码" class="wechat-qr" />
          </div>
          <div class="wechat-dialog-actions">
            <button class="wechat-close-button" type="button" @click="closeWechatDialog">关闭</button>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  color: var(--ink);
}

.container {
  width: min(720px, calc(100% - 2rem));
  margin: 0 auto;
  padding: clamp(2rem, 8vw, 5rem) 0 clamp(2rem, 8vw, 4rem);
}

.hero {
  display: grid;
  gap: 1.5rem;
  padding-bottom: clamp(1rem, 1vw, 1.5rem);
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.profile-image {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  filter: grayscale(0.08);
}

.hero-copy {
  min-width: 0;
}

.hero-kicker,
.dialog-eyebrow {
  margin: 0 0 0.35rem;
  color: var(--muted);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--navy);
  font-size: clamp(2.35rem, 8vw, 4.4rem);
  line-height: 0.95;
  font-weight: 700;
  letter-spacing: -0.06em;
}

.hero-bio {
  max-width: 34rem;
  margin-top: 0.8rem;
  color: var(--muted);
  font-size: 0.98rem;
}

.hero-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.nav-shell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.tab-button,
.theme-toggle {
  border: 0;
  color: var(--muted);
  background: transparent;
  font: inherit;
}

.tab-button {
  padding: 0;
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  transition: color 160ms ease, opacity 160ms ease;
}

.tab-button:hover,
.tab-button.is-active {
  color: var(--navy);
}

.tab-button.is-active {
  text-decoration: underline;
  text-underline-offset: 0.28rem;
}

.theme-toggle {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  cursor: pointer;
  transition: color 160ms ease, opacity 160ms ease;
}

.theme-toggle:hover {
  color: var(--navy);
}

.theme-toggle svg {
  display: block;
  width: 1rem;
  height: 1rem;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1rem;
}

.social-button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0;
  border: 0;
  color: var(--muted);
  background: transparent;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color 160ms ease, opacity 160ms ease;
}

.social-button:hover {
  color: var(--navy);
}

.social-icon-wrap {
  display: grid;
  width: 1rem;
  height: 1rem;
  place-items: center;
  color: currentColor;
}

.social-icon-wrap :deep(svg) {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  fill: currentColor !important;
  color: currentColor;
}

.social-icon-wrap :deep(svg path),
.social-icon-wrap :deep(svg circle),
.social-icon-wrap :deep(svg rect),
.social-icon-wrap :deep(svg polygon) {
  fill: currentColor !important;
}

.social-icon-wrap :deep(svg path[stroke]),
.social-icon-wrap :deep(svg circle[stroke]),
.social-icon-wrap :deep(svg rect[stroke]),
.social-icon-wrap :deep(svg polygon[stroke]) {
  stroke: currentColor !important;
}

.social-label {
  white-space: nowrap;
}

.main-content {
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
}

.page-section {
  display: block;
}

.tab-panel-enter-active,
.tab-panel-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.tab-panel-enter-from,
.tab-panel-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}

.footer {
  display: grid;
  gap: 0.35rem;
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}

.footer p {
  color: var(--muted);
  font-size: 0.82rem;
}

.icp-info a {
  color: inherit;
  text-decoration: none;
}

.icp-info a:hover {
  color: var(--navy);
}

.wechat-dialog-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.38);
}

.wechat-dialog {
  position: relative;
  width: min(100%, 24rem);
  padding: 1.5rem;
  border: 1px solid var(--line);
  background: var(--paper);
}

.wechat-dialog-x {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  border: 0;
  color: var(--muted);
  background: transparent;
  font: inherit;
  font-size: 1.3rem;
  cursor: pointer;
}

.wechat-dialog-title {
  margin: 0;
  color: var(--navy);
  font-size: 1.2rem;
  font-weight: 700;
}

.wechat-qr-shell {
  margin-top: 1rem;
}

.wechat-qr {
  display: block;
  width: 100%;
  border: 1px solid var(--line);
}

.wechat-dialog-actions {
  margin-top: 1rem;
}

.wechat-close-button {
  padding: 0;
  border: 0;
  color: var(--navy);
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.wechat-dialog-fade-enter-active,
.wechat-dialog-fade-leave-active {
  transition: opacity 180ms ease;
}

.wechat-dialog-fade-enter-from,
.wechat-dialog-fade-leave-to {
  opacity: 0;
}

@media (max-width: 680px) {
  .container {
    width: min(100%, calc(100% - 1.5rem));
  }

  .hero-main {
    align-items: flex-start;
  }

  .hero-meta {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
