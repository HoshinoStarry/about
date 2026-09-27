<script setup>
const friendLinks = [
  {
    name: '朋友的网站',
    url: 'https://example.com/',
    avatar: '/avatar.png',
    description: '这里写一句简单的介绍。',
  },
];
</script>

<template>
  <section class="page-panel">
    <p class="eyebrow">Friends</p>
    <h2 class="title">朋友们</h2>
    <ul class="friend-list">
      <li v-for="friend in friendLinks" :key="friend.url" class="friend-item">
        <a
          class="friend-card"
          :href="friend.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`访问 ${friend.name} 的网站`"
        >
          <img class="friend-avatar" :src="friend.avatar" :alt="`${friend.name} 的头像`" loading="lazy" />
          <span class="friend-info">
            <strong class="friend-name">{{ friend.name }}</strong>
            <span class="friend-description">{{ friend.description }}</span>
          </span>
          <span class="material-icons friend-open-icon" aria-hidden="true">open_in_new</span>
        </a>
      </li>
    </ul>
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

.friend-list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.friend-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 5.5rem;
  padding: 1rem;
  border: 1px solid var(--line);
  color: inherit;
  background: var(--panel-weak);
  text-decoration: none;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.friend-card:hover {
  border-color: var(--muted);
  background: var(--panel);
}

.friend-card:focus-visible {
  outline: 2px solid var(--navy);
  outline-offset: 2px;
}

.friend-avatar {
  width: 3.5rem;
  height: 3.5rem;
  flex: none;
  border: 1px solid var(--line);
  border-radius: 50%;
  object-fit: cover;
}

.friend-info {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 0.3rem;
}

.friend-name {
  color: var(--navy);
  font-size: 1rem;
  font-weight: 800;
}

.friend-description {
  color: var(--muted);
  line-height: 1.6;
}

.friend-open-icon {
  flex: none;
  align-self: center;
  color: var(--muted);
  font-size: 1.1rem;
}
</style>
