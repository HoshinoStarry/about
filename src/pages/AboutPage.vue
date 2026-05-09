<script setup>
import AboutMe from '@/components/contents/AboutMe.vue';
</script>

<template>
  <section class="page-panel">
    <p class="eyebrow">About</p>
    <h2 class="title">关于我</h2>
    <AboutMe />
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
</style>
