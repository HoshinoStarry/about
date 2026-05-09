<script setup>
import MarkdownContent from '@/components/common/MarkdownContent.vue';
import aboutMarkdown from '@/content/about.md?raw';
</script>

<template>
  <MarkdownContent :source="aboutMarkdown" />
</template>
