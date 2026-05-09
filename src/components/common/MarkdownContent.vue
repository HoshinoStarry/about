<script setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
});

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
});

const defaultLinkOpen = markdown.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex('href');
  const href = hrefIndex >= 0 ? token.attrs[hrefIndex][1] : '';

  if (/^https?:\/\//i.test(href)) {
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noopener noreferrer');
  }

  return defaultLinkOpen(tokens, idx, options, env, self);
};

const html = computed(() => markdown.render(props.source));
</script>

<template>
  <article class="markdown-content" v-html="html"></article>
</template>

<style scoped>
.markdown-content {
  color: var(--muted);
  line-height: 1.85;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 1.4rem 0 0.65rem;
  color: var(--navy);
  font-weight: 900;
  line-height: 1.2;
}

.markdown-content :deep(h1:first-child),
.markdown-content :deep(h2:first-child),
.markdown-content :deep(h3:first-child),
.markdown-content :deep(h4:first-child),
.markdown-content :deep(h5:first-child),
.markdown-content :deep(h6:first-child) {
  margin-top: 0;
}

.markdown-content :deep(h1) {
  font-size: clamp(2rem, 4vw, 3rem);
}

.markdown-content :deep(h2) {
  font-size: clamp(1.65rem, 3vw, 2.25rem);
}

.markdown-content :deep(h3) {
  font-size: clamp(1.25rem, 2.2vw, 1.6rem);
}

.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-size: 1.05rem;
}

.markdown-content :deep(p) {
  margin: 0 0 1rem;
}

.markdown-content :deep(strong) {
  color: var(--navy);
  font-weight: 900;
}

.markdown-content :deep(em) {
  color: var(--violet);
  font-style: normal;
  font-weight: 800;
}

.markdown-content :deep(code) {
  padding: 0.12rem 0.38rem;
  border-radius: 0.5rem;
  color: var(--chip-text);
  background: var(--chip-bg);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.92em;
}

.markdown-content :deep(pre) {
  overflow: auto;
  margin: 0 0 1rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 1.1rem;
  background: var(--panel-blue);
}

.markdown-content :deep(pre code) {
  padding: 0;
  border-radius: 0;
  background: transparent;
}

.markdown-content :deep(a) {
  color: var(--blue-strong);
  font-weight: 800;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(ol),
.markdown-content :deep(ul) {
  margin: 0 0 1rem;
  padding-left: 1.45rem;
}

.markdown-content :deep(li + li) {
  margin-top: 0.35rem;
}

.markdown-content :deep(del) {
  color: color-mix(in srgb, var(--muted) 68%, transparent);
}

.markdown-content :deep(blockquote) {
  margin: 0 0 1rem;
  padding: 0.9rem 1rem;
  border-left: 0.35rem solid var(--blue-strong);
  border-radius: 0 1rem 1rem 0;
  color: var(--navy);
  background: var(--panel-blue);
}

.markdown-content :deep(table) {
  display: block;
  overflow-x: auto;
  width: 100%;
  margin: 0 0 1rem;
  border-collapse: collapse;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--line);
}

.markdown-content :deep(th) {
  color: var(--navy);
  background: var(--panel-blue);
  font-weight: 900;
}
</style>
