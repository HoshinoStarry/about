<script setup>
import { computed, markRaw, ref, onBeforeUnmount, onMounted, watch } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

import avatarImage from './assets/avatar.png';
import avatarHoverImage from './assets/avatar-hover.png';
import logoImage from './assets/logo.png';
import wechatQrCode from './assets/wechat_mp_qrcode.jpg';

import IconGithub from './components/icons/Github.vue';
import IconBilibili from './components/icons/Bilibili.vue';
import IconTelegram from './components/icons/Telegram.vue';
import IconSteam from './components/icons/Steam.vue';
import IconX from './components/icons/X.vue';
import IconWeChat from './components/icons/WeChat.vue';
import IconQQ from './components/icons/QQ.vue';
import IconEmail from '@/components/icons/Email.vue';
import { navRoutes } from '@/router';

const name = ref('HoshinoStarry');
const bio = ref('音游、动画、数码，还有一些普通日常');
const siteIcp = ref('浙ICP备2025208590号-1');
const sumiUrl = 'https://sumi.hoshino.host/';
const sumiNoticeAcceptedKey = 'hoshino.sumi.ai-content-notice.accepted';
const sumiMetaHiddenKey = 'hoshino.sumi.meta.hidden';

const socialLinks = ref([
  { name: 'Email', url: 'mailto:admin@hoshino.host', icon: markRaw(IconEmail) },
  { name: 'Bilibili', url: 'https://space.bilibili.com/179663677', icon: markRaw(IconBilibili) },
  { name: 'QQ', url: 'https://wpa.qq.com/msgrd?v=3&uin=2583080860&site=qq&menu=yes', icon: markRaw(IconQQ) },
  { name: 'WeChat', url: '', icon: markRaw(IconWeChat) },
]);

const formatClassName = (value) => value
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const socialButtonClass = (social) => `social-button-${formatClassName(social.name)}`;

const overseaSocialLinks = ref([
  { name: 'GitHub', url: 'https://github.com/HoshinoStarry', icon: markRaw(IconGithub) },
  { name: 'Steam', url: 'https://steamcommunity.com/id/HoshinoStarry/', icon: markRaw(IconSteam) },
  { name: 'Telegram', url: 'https://t.me/HoshinoStarry', icon: markRaw(IconTelegram) },
  { name: 'X(Twitter)', url: 'https://twitter.com/HoshinoStarry', icon: markRaw(IconX) },
]);

const nowYear = ref(new Date().getFullYear());
const userIpInfo = ref({});
const cloudflareNode = ref('');
const isGeoResolved = ref(false);
const isGeoCheckFinished = ref(false);
const shouldShowOverseaContent = computed(() => isGeoResolved.value && userIpInfo.value.country_code !== 'CN');
const tabItems = computed(() => navRoutes.filter(
  (item) => !item.requiresOversea || shouldShowOverseaContent.value,
));
const userIsp = computed(() => (
  userIpInfo.value.isp
  || userIpInfo.value.organization
  || userIpInfo.value.asn_organization
  || '未知'
));
const userAsn = computed(() => {
  const asn = String(userIpInfo.value.asn || '').trim();

  if (!asn) return 'ASN未知';
  return /^AS/i.test(asn) ? asn.toUpperCase() : `AS${asn}`;
});
const isWechatDialogOpen = ref(false);
const isSumiNoticeOpen = ref(false);
const isSumiMetaHidden = ref(false);
const isProfileAlternate = ref(false);

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
  } finally {
    isGeoCheckFinished.value = true;
  }
};

const fetchCloudflareNode = async () => {
  try {
    const response = await fetch('/', { method: 'HEAD', cache: 'no-store' });
    const rayId = response.headers.get('cf-ray') || '';
    const node = rayId.split('-').at(-1)?.toUpperCase() || '';

    if (/^[A-Z]{3}$/.test(node)) {
      cloudflareNode.value = node;
    }
  } catch (error) {
    console.warn('获取 Cloudflare 节点信息失败:', error);
  }
};

const showWechatDialog = () => {
  isWechatDialogOpen.value = true;
};

const showAlternateProfile = (event) => {
  if (event.pointerType !== 'mouse') return;
  isProfileAlternate.value = true;
};

const showDefaultProfile = (event) => {
  if (event.pointerType !== 'mouse') return;
  isProfileAlternate.value = false;
};

const toggleAlternateProfile = () => {
  isProfileAlternate.value = !isProfileAlternate.value;
};

const closeWechatDialog = () => {
  isWechatDialogOpen.value = false;
};

const hasAcceptedSumiNotice = () => {
  try {
    return window.localStorage.getItem(sumiNoticeAcceptedKey) === 'true';
  } catch (error) {
    console.warn('无法读取 OC 提示状态:', error);
    return false;
  }
};

const hasHiddenSumiMeta = () => {
  try {
    return window.localStorage.getItem(sumiMetaHiddenKey) === 'true';
  } catch (error) {
    console.warn('无法读取 OC 入口状态:', error);
    return false;
  }
};

const openSumiPage = () => {
  window.open(sumiUrl, '_blank', 'noopener,noreferrer');
};

const openSumiMeta = () => {
  if (hasAcceptedSumiNotice()) {
    openSumiPage();
    return;
  }

  isSumiNoticeOpen.value = true;
};

const continueToSumi = () => {
  try {
    window.localStorage.setItem(sumiNoticeAcceptedKey, 'true');
  } catch (error) {
    console.warn('无法保存 OC 提示状态:', error);
  }

  isSumiNoticeOpen.value = false;
  openSumiPage();
};

const dismissSumiMeta = () => {
  try {
    window.localStorage.setItem(sumiMetaHiddenKey, 'true');
  } catch (error) {
    console.warn('无法保存 OC 入口状态:', error);
  }

  isSumiNoticeOpen.value = false;
  isSumiMetaHidden.value = true;
};

const closeSumiNotice = () => {
  isSumiNoticeOpen.value = false;
};

onMounted(() => {
  isSumiMetaHidden.value = hasHiddenSumiMeta();
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemDark.value = mediaQuery.matches;

  const syncSystemTheme = (event) => {
    systemDark.value = event.matches;
  };

  mediaQuery.addEventListener('change', syncSystemTheme);
  mediaQuery._personalIntroSync = syncSystemTheme;
  applyTheme();
  fetchUserLocationAndSocialLinks();
  fetchCloudflareNode();

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
          <div
            class="profile-image-shell"
            @pointerenter="showAlternateProfile"
            @pointerleave="showDefaultProfile"
          >
            <img
              :src="avatarImage"
              alt="HoshinoStarry 的头像"
              class="profile-image profile-image-default"
              :class="{ 'profile-image-active': !isProfileAlternate }"
            />
            <img
              :src="avatarHoverImage"
              alt=""
              aria-hidden="true"
              class="profile-image profile-image-alternate"
              :class="{ 'profile-image-active': isProfileAlternate }"
            />
            <button
              type="button"
              class="profile-image-trigger"
              aria-label="切换头像"
              @click="toggleAlternateProfile"
            ></button>
          </div>
          <h1 class="hero-title">
            <img :src="logoImage" alt="HoshinoStarry" class="hero-logo" />
          </h1>
        </div>

        <p class="hero-bio">{{ bio }}</p>

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
              <span class="material-symbols-rounded tab-icon" aria-hidden="true">{{ item.icon }}</span>
              <span class="tab-label">{{ item.label }}</span>
            </RouterLink>
          </nav>

          <button
            v-if="!isSumiMetaHidden"
            class="sumi-meta-button"
            type="button"
            aria-haspopup="dialog"
            :aria-expanded="isSumiNoticeOpen"
            @click="openSumiMeta"
          >
            <span>OC</span>
            <span class="material-icons sumi-meta-icon" aria-hidden="true">open_in_new</span>
          </button>

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
              <component
                :is="Component"
                :show-github-stats="route.name === 'intro' ? shouldShowOverseaContent : undefined"
                :allow-github-content="route.name === 'guestbook' ? shouldShowOverseaContent : undefined"
                :geo-resolved="route.name === 'guestbook' ? isGeoResolved : undefined"
                :geo-check-finished="route.name === 'guestbook' ? isGeoCheckFinished : undefined"
                :theme="route.name === 'guestbook' ? resolvedTheme : undefined"
              />
            </section>
          </Transition>
        </RouterView>
      </main>

      <footer class="footer">
        <p class="icp-info">
          &copy; {{ nowYear }} {{ name }} ·
          <strong>除另有说明外，本站部分内容由生成式人工智能生成</strong> ·
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">{{ siteIcp }}</a>
        </p>
        <p v-if="userIpInfo.ip">
          您的IP地址:
          <a
            :href="`https://ip.sb/ip/${encodeURIComponent(userIpInfo.ip)}`"
            target="_blank"
            rel="noopener noreferrer"
          >{{ userIpInfo.ip }}</a>
          ({{ userIpInfo.country || '未知国家' }} {{ userIpInfo.region || '未知地区' }} {{ userIpInfo.city || '未知城市' }} - {{ userIsp }} · {{ userAsn }})
          <template v-if="cloudflareNode">
            ·
            <a
              class="cloudflare-node"
              href="https://www.cloudflare.com/network/"
              target="_blank"
              rel="noopener noreferrer"
              title="查看 Cloudflare 全球网络"
            >
              <svg class="cloudflare-node-icon" viewBox="50 0 49.5 22.2" aria-hidden="true">
                <path fill="#fff" d="M94.7 10.6 89.1 9.3l-1-.4-25.7.2v12.4l32.3.1Z" />
                <path fill="#f48120" d="M84.2 20.4a2.86 2.86 0 0 0-.3-2.6 3.1 3.1 0 0 0-2.1-1.1l-17.4-.2-.3-.1a.19.19 0 0 1 0-.3c.1-.2.2-.3.4-.3l17.5-.2a6.3 6.3 0 0 0 5.1-3.8l1-2.6v-.3a11.4 11.4 0 0 0-21.9-1.2 5.46 5.46 0 0 0-3.6-1 5.2 5.2 0 0 0-4.6 4.6 5.46 5.46 0 0 0 .1 1.8 7.3 7.3 0 0 0-7.1 7.3 4.1 4.1 0 0 0 .1 1.1.32.32 0 0 0 .3.3h32.1c.2 0 .4-.1.4-.3Z" />
                <path fill="#faad3f" d="M89.7 9.2h-.5l-.3.2-.7 2.4a2.86 2.86 0 0 0 .3 2.6 3.1 3.1 0 0 0 2.1 1.1l3.7.2.3.1a.19.19 0 0 1 0 .3c-.1.2-.2.3-.4.3l-3.8.2a6.3 6.3 0 0 0-5.1 3.8l-.2.9c-.1.1 0 .3.2.3h13.2a.27.27 0 0 0 .3-.3 10.87 10.87 0 0 0 .4-2.6 9.56 9.56 0 0 0-9.5-9.5" />
              </svg>
              <span>{{ cloudflareNode }}</span>
            </a>
          </template>
        </p>
      </footer>
    </div>

    <Transition name="wechat-dialog-fade">
      <div v-if="isWechatDialogOpen" class="wechat-dialog-layer" role="presentation" @click.self="closeWechatDialog">
        <section class="wechat-dialog" role="dialog" aria-modal="true" aria-labelledby="wechat-dialog-title">
          <button class="wechat-dialog-x" type="button" aria-label="关闭微信公众号弹窗" @click="closeWechatDialog">×</button>
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

    <Transition name="wechat-dialog-fade">
      <div v-if="isSumiNoticeOpen" class="wechat-dialog-layer" role="presentation" @click.self="closeSumiNotice">
        <section
          class="wechat-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sumi-notice-title"
          aria-describedby="sumi-notice-description"
        >
          <button class="wechat-dialog-x" type="button" aria-label="关闭 OC 提示" @click="closeSumiNotice">×</button>
          <h2 id="sumi-notice-title" class="wechat-dialog-title">提示</h2>
          <p id="sumi-notice-description" class="sumi-notice-description">此页面包含大量由生成式人工智能生成的作品，是否继续访问？</p>
          <div class="sumi-dialog-actions">
            <button class="sumi-dialog-button" type="button" @click="dismissSumiMeta">算了</button>
            <button class="sumi-dialog-button sumi-dialog-button-primary" type="button" @click="continueToSumi">继续</button>
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
  position: relative;
  display: grid;
  gap: 1.5rem;
  padding-bottom: clamp(1rem, 1vw, 1.5rem);
}

.hero-main {
  --hero-logo-height: calc(var(--hero-row-height) * 0.7);
  --hero-row-height: max(10rem, 18vw);
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding-right: 3rem;
  gap: 1.25rem;
}

.profile-image-shell {
  position: relative;
  flex: none;
  width: var(--hero-row-height);
  height: var(--hero-row-height);
  border-radius: 50%;
  overflow: hidden;
}

.profile-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 5px solid white;
  border-radius: 50%;
  object-fit: cover;
  filter: grayscale(0.08);
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-image-active {
  opacity: 1;
}

.profile-image-trigger {
  position: absolute;
  inset: 0;
  border: 0;
  padding: 0;
  border-radius: inherit;
  background: transparent;
  cursor: pointer;
  outline-offset: -3px;
}

.hero-copy {
  min-width: 0;
}

.hero-kicker {
  margin: 0 0 0.35rem;
  color: var(--muted);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-kicker {
  padding-right: 3.25rem;
}

.hero-title {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  min-width: 0;
  height: var(--hero-logo-height);
  margin: 0;
  line-height: 0;
}

.hero-logo {
  display: block;
  width: auto;
  max-width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: left center;
}

.hero-bio {
  max-width: 34rem;
  margin-top: 0;
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
.sumi-meta-button,
.theme-toggle {
  border: 0;
  color: var(--muted);
  background: transparent;
  font: inherit;
}

.tab-button,
.sumi-meta-button {
  padding: 0;
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  transition: color 160ms ease, opacity 160ms ease;
}

.tab-button {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.tab-icon {
  font-size: 1rem;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
  line-height: 1;
}

.tab-button:hover,
.sumi-meta-button:hover,
.tab-button.is-active {
  color: var(--navy);
}

.sumi-meta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.sumi-meta-icon {
  font-size: 0.9rem;
  line-height: 1;
}

.tab-button.is-active {
  text-decoration: none;
}

.tab-button.is-active .tab-label {
  text-decoration: underline;
  text-underline-offset: 0.28rem;
}

.theme-toggle {
  position: absolute;
  top: 0;
  right: 0;
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

.social-button-email {
  --social-hover: #2563eb;
}

.social-button-bilibili {
  --social-hover: #0078a5;
}

.social-button-wechat {
  --social-hover: #087d38;
}

.social-button-qq {
  --social-hover: #087caf;
}

.social-button-github {
  --social-hover: #076f24;
}

.social-button-steam {
  --social-hover: #0f739d;
}

.social-button-telegram {
  --social-hover: #08739b;
}

.social-button-x-twitter {
  --social-hover: #000000;
}

:global(:root[data-theme='dark'] .social-button-email) {
  --social-hover: #60a5fa;
}

:global(:root[data-theme='dark'] .social-button-bilibili) {
  --social-hover: #00aeec;
}

:global(:root[data-theme='dark'] .social-button-wechat) {
  --social-hover: #07c160;
}

:global(:root[data-theme='dark'] .social-button-qq) {
  --social-hover: #1ebafc;
}

:global(:root[data-theme='dark'] .social-button-github) {
  --social-hover: #5fed83;
}

:global(:root[data-theme='dark'] .social-button-steam) {
  --social-hover: #66c0f4;
}

:global(:root[data-theme='dark'] .social-button-telegram) {
  --social-hover: #2aabee;
}

:global(:root[data-theme='dark'] .social-button-x-twitter) {
  --social-hover: #ffffff;
}

.social-button:hover,
.social-button:focus-visible {
  color: var(--social-hover, var(--navy));
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

.cloudflare-node {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: inherit;
  text-decoration: none;
  white-space: nowrap;
}

.cloudflare-node:hover,
.cloudflare-node:focus-visible {
  color: var(--navy);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.cloudflare-node-icon {
  width: 1.35em;
  height: 0.75em;
  flex: none;
}

.icp-info a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.2em;
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

.sumi-notice-description {
  margin-top: 1rem;
  color: var(--muted);
  line-height: 1.7;
}

.sumi-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.25rem;
}

.sumi-dialog-button {
  min-height: 2.75rem;
  padding: 0 0.25rem;
  border: 0;
  color: var(--muted);
  background: transparent;
  font: inherit;
  cursor: pointer;
  transition: color 160ms ease;
}

.sumi-dialog-button:hover,
.sumi-dialog-button:focus-visible,
.sumi-dialog-button-primary {
  color: var(--navy);
}

.sumi-dialog-button-primary {
  font-weight: 700;
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
    align-items: flex-end;
    --hero-row-height: max(10rem, 18vw);
    padding-right: 3.25rem;
    gap: 1rem;
  }
}
</style>
