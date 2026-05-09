<script setup>
import MarkdownContent from '@/components/common/MarkdownContent.vue';
import devicesMarkdown from '@/content/devices.md?raw';
</script>

<template>
  <MarkdownContent :source="devicesMarkdown" />
</template>
