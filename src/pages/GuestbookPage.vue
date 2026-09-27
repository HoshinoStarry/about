<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  allowGithubContent: {
    type: Boolean,
    default: false,
  },
  geoResolved: {
    type: Boolean,
    default: false,
  },
  geoCheckFinished: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: 'light',
  },
});

const discussionUrl = 'https://github.com/HoshinoStarry/about/discussions/2';
const giscusThemeVersion = '20260720-1';
const giscusRoot = ref(null);
const isLoading = ref(false);
const loadError = ref(false);
let giscusScript;
let giscusObserver;
let giscusLoadTimeout;

const giscusTheme = () => {
  const themeName = props.theme === 'dark' ? 'dark' : 'light';
  const themeUrl = new URL(`/giscus-${themeName}.css`, window.location.origin);
  themeUrl.searchParams.set('v', giscusThemeVersion);
  return themeUrl.href;
};

const clearGiscus = () => {
  giscusObserver?.disconnect();
  giscusObserver = undefined;
  window.clearTimeout(giscusLoadTimeout);
  giscusLoadTimeout = undefined;
  giscusRoot.value?.replaceChildren();
  giscusScript = undefined;
  isLoading.value = false;
  loadError.value = false;
};

const loadGiscus = async () => {
  await nextTick();

  if (!props.allowGithubContent || !giscusRoot.value) return;

  clearGiscus();
  isLoading.value = true;

  const finishLoading = () => {
    if (!giscusScript) return;

    giscusObserver?.disconnect();
    giscusObserver = undefined;
    window.clearTimeout(giscusLoadTimeout);
    giscusLoadTimeout = undefined;
    isLoading.value = false;
  };

  giscusObserver = new MutationObserver(() => {
    const frame = giscusRoot.value?.querySelector('iframe.giscus-frame');

    if (!frame) return;
    frame.addEventListener('load', finishLoading, { once: true });
  });
  giscusObserver.observe(giscusRoot.value, { childList: true, subtree: true });

  giscusLoadTimeout = window.setTimeout(() => {
    if (!isLoading.value) return;

    giscusObserver?.disconnect();
    giscusObserver = undefined;
    isLoading.value = false;
    loadError.value = true;
  }, 15000);

  const script = document.createElement('script');
  giscusScript = script;
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-repo', 'HoshinoStarry/about');
  script.setAttribute('data-repo-id', 'R_kgDOSYoEMg');
  script.setAttribute('data-category', 'General');
  script.setAttribute('data-category-id', 'DIC_kwDOSYoEMs4DBdkm');
  script.setAttribute('data-mapping', 'number');
  script.setAttribute('data-term', '2');
  script.setAttribute('data-strict', '1');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'top');
  script.setAttribute('data-theme', giscusTheme());
  script.setAttribute('data-lang', 'zh-CN');

  script.addEventListener('error', () => {
    if (giscusScript === script) {
      giscusObserver?.disconnect();
      giscusObserver = undefined;
      window.clearTimeout(giscusLoadTimeout);
      giscusLoadTimeout = undefined;
      isLoading.value = false;
      loadError.value = true;
    }
  });

  giscusRoot.value.appendChild(script);
};

const syncGiscusTheme = () => {
  const frame = giscusRoot.value?.querySelector('iframe.giscus-frame');

  frame?.contentWindow?.postMessage({
    giscus: {
      setConfig: { theme: giscusTheme() },
    },
  }, 'https://giscus.app');
};

watch(
  () => props.allowGithubContent,
  (isAllowed) => {
    if (isAllowed) {
      loadGiscus();
      return;
    }

    clearGiscus();
  },
  { immediate: true },
);

watch(() => props.theme, syncGiscusTheme);

onBeforeUnmount(clearGiscus);
</script>

<template>
  <section class="page-panel">
    <p class="eyebrow">Guestbook</p>
    <h2 class="title">留言板</h2>

    <p v-if="!props.geoCheckFinished" class="guestbook-status">正在确认访问区域……</p>
    <p v-else-if="!props.geoResolved" class="guestbook-status">暂时无法确认访问区域，因此没有加载留言板。</p>
    <p v-else-if="!props.allowGithubContent" class="guestbook-status">留言板暂未在你所在的地区提供。</p>

    <template v-else>
      <div class="guestbook-intro">
        <p>想说点什么，就在这里留下一句吧。</p>
      </div>

      <div key="giscus-root" ref="giscusRoot" class="giscus-root" aria-live="polite"></div>
      <p v-if="isLoading" class="guestbook-status">正在加载留言……</p>
      <p v-else-if="loadError" class="guestbook-status">
        留言框暂时没加载出来，可以先去
        <a :href="discussionUrl" target="_blank" rel="noopener noreferrer">GitHub Discussions</a>
        留言。
      </p>
    </template>
  </section>
</template>

<style scoped>
.page-panel {
  display: grid;
  gap: 1rem;
}

.eyebrow {
  color: var(--muted);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.title {
  color: var(--navy);
  font-size: 1.35rem;
  font-weight: 700;
}

.guestbook-intro {
  color: var(--muted);
}

.guestbook-status a {
  color: var(--navy);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.22em;
}

.guestbook-status {
  color: var(--muted);
}

.giscus-root {
  min-width: 0;
  padding-top: 0.25rem;
}

</style>
