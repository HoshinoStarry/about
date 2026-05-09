<script setup>
import MyDevicesHistory from '@/components/contents/MyDevicesHistory.vue';
</script>

<template>
  <section class="page-panel">
    <p class="eyebrow">Devices</p>
    <h2 class="title">设备清单</h2>
    <MyDevicesHistory />
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
