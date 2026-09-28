<script setup>
import { computed, onMounted, ref } from 'vue';

const username = 'HoshinoStarry';
const contributionDays = ref([]);
const isLoading = ref(true);
const error = ref('');

const visibleDays = computed(() => {
  if (!contributionDays.value.length) return [];

  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  const dayMap = new Map(contributionDays.value.map(day => [day.date, day]));
  const days = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    days.push(dayMap.get(key) || { date: key, count: 0, level: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
});

const columns = computed(() => {
  const result = [];

  for (let index = 0; index < visibleDays.value.length; index += 7) {
    result.push(visibleDays.value.slice(index, index + 7));
  }

  return result;
});

const monthLabels = computed(() => {
  const labels = [];
  let previousMonth = -1;

  columns.value.forEach((column, columnIndex) => {
    const month = Number(column[0].date.slice(5, 7));
    if (month === previousMonth) return;

    labels.push({ key: `${column[0].date}-${columnIndex}`, label: `${month}月`, column: columnIndex + 1 });
    previousMonth = month;
  });

  return labels;
});

const total = computed(() => visibleDays.value.reduce((sum, day) => sum + day.count, 0));
const range = computed(() => visibleDays.value.length
  ? `${visibleDays.value[0].date.replaceAll('-', '/')} - ${visibleDays.value.at(-1).date.replaceAll('-', '/')}`
  : '');

const loadContributions = async () => {
  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    contributionDays.value = payload.contributions
      .map(({ date, count, level }) => ({
        date,
        count,
        level: Math.min(Math.max(Number(level) || 0, 0), 4),
      }))
      .sort((first, second) => first.date.localeCompare(second.date));
  } catch {
    error.value = '暂时无法加载 GitHub 活跃度';
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadContributions);
</script>

<template>
  <div class="activity">
    <h3 class="activity-title">GitHub 活跃度</h3>

    <p v-if="error" class="state">{{ error }}</p>
    <template v-else>
      <p class="summary">
        <strong>{{ total }}</strong> contributions
        <span>{{ range }}</span>
      </p>

      <div class="heatmap" :class="{ loading: isLoading }">
        <div class="months">
          <span
            v-for="month in monthLabels"
            :key="month.key"
            :style="{ gridColumnStart: month.column }"
          >{{ month.label }}</span>
        </div>

        <div class="grid">
          <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="column">
            <span
              v-for="day in column"
              :key="day.date"
              :class="`level-${day.level}`"
              :title="`${day.count} contributions on ${day.date}`"
            ></span>
          </div>
        </div>
      </div>

      <div class="legend" aria-hidden="true">
        <span>Less</span>
        <i class="level-0"></i>
        <i class="level-1"></i>
        <i class="level-2"></i>
        <i class="level-3"></i>
        <i class="level-4"></i>
        <span>More</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.activity {
  --cell-empty: #ebedf0;
  --cell-1: #9be9a8;
  --cell-2: #40c463;
  --cell-3: #30a14e;
  --cell-4: #216e39;
  margin-top: 1.5rem;
}

.activity-title {
  margin-bottom: 0.75rem;
  color: var(--navy);
  font-size: 1rem;
  font-weight: 700;
}

.state {
  color: var(--muted);
  font-size: 0.9rem;
}

.summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.75rem;
  color: var(--navy);
  font-size: 0.9rem;
}

.summary strong {
  font-weight: 900;
}

.summary span {
  color: var(--muted);
  font-size: 0.78rem;
  white-space: nowrap;
}

.heatmap.loading {
  min-height: 7rem;
}

.months,
.grid {
  display: grid;
  grid-template-columns: repeat(53, minmax(0, 1fr));
  gap: 3px;
}

.months {
  margin-bottom: 0.25rem;
  color: var(--muted);
  font-size: 0.68rem;
  line-height: 1;
}

.column {
  display: grid;
  align-content: start;
  gap: 3px;
}

.column span,
.legend i {
  aspect-ratio: 1;
  border-radius: 2px;
  background: var(--cell-empty);
}

.column .level-1 { background: var(--cell-1); }
.column .level-2 { background: var(--cell-2); }
.column .level-3 { background: var(--cell-3); }
.column .level-4 { background: var(--cell-4); }

.legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  margin-top: 0.5rem;
  color: var(--muted);
  font-size: 0.7rem;
}

.legend i {
  width: 0.8rem;
}

@media (max-width: 720px) {
  .summary {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.15rem;
  }

  .months {
    display: none;
  }
}

@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme])) .activity {
    --cell-empty: #161b22;
    --cell-1: #0e4429;
    --cell-2: #006d32;
    --cell-3: #26a641;
    --cell-4: #39d353;
  }
}

:global(:root[data-theme='dark']) .activity {
  --cell-empty: #161b22;
  --cell-1: #0e4429;
  --cell-2: #006d32;
  --cell-3: #26a641;
  --cell-4: #39d353;
}
</style>
