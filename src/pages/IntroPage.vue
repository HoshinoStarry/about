<script setup>
import { computed, ref } from 'vue';
import MarkdownContent from '@/components/common/MarkdownContent.vue';
import homeMarkdown from '@/content/home.md?raw';

const props = defineProps({
  showGithubStats: {
    type: Boolean,
    default: false,
  },
});

const githubUsername = ref('HoshinoStarry');
const githubStatsUrl = computed(() => `https://github-readme-stats-one-bice.vercel.app/api?username=${encodeURIComponent(githubUsername.value)}&show_icons=true&locale=cn`);
const githubTopLangsUrl = computed(() => `https://github-readme-stats-one-bice.vercel.app/api/top-langs/?username=${encodeURIComponent(githubUsername.value)}&layout=compact&langs_count=8&role=OWNER,ORGANIZATION_MEMBER&show_icons=true&locale=cn`);
</script>

<template>
  <section class="page-panel">
    <p class="eyebrow">Intro</p>
    <h2 class="title">个人主页简介</h2>
    <MarkdownContent :source="homeMarkdown" />
    <div v-if="props.showGithubStats" class="embedded-github-stats">
      <h3 class="embedded-title">GitHub 统计</h3>
      <div class="github-stats">
        <img
          :src="githubStatsUrl"
          alt="GitHub Stats"
          class="stats-image"
        />
        <img
          :src="githubTopLangsUrl"
          alt="Top Langs"
          class="langs-image"
        />
      </div>
    </div>
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

.embedded-github-stats {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}

.embedded-title {
  margin-bottom: 0.85rem;
  color: var(--navy);
  font-size: 1rem;
  font-weight: 700;
}

.github-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.stats-image,
.langs-image {
  height: 140px;
}

@media (max-width: 720px) {
  .github-stats {
    grid-template-columns: 1fr;
  }
}
</style>
