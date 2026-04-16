<script setup lang="ts">
import type { ContributionData } from '~/types/blog';

defineProps<{
  data?: ContributionData | null;
}>();

const colorLevels = [
  'bg-[#ebedf0]',
  'bg-[#9be9a8]',
  'bg-[#40c463]',
  'bg-[#30a14e]',
  'bg-[#216e39]',
];

function getContributionLevel(count: number) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
}
</script>

<template>
  <div v-if="data" class="blog-panel p-6">
    <div class="mb-4 flex items-center justify-between">
      <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Activity</p>
      <p class="text-xs text-[var(--blog-subtle)]">Past year: {{ data.totalContributions }} contributions</p>
    </div>

    <div class="overflow-x-auto">
      <div class="flex gap-[3px]" style="min-width: 680px;">
        <div v-for="(week, weekIndex) in data.weeks" :key="weekIndex" class="flex flex-col gap-[3px]">
          <div
            v-for="(day, dayIndex) in week.contributionDays"
            :key="`${weekIndex}-${dayIndex}`"
            :class="`h-[10px] w-[10px] rounded-sm ${colorLevels[getContributionLevel(day.contributionCount)]}`"
            :title="`${day.date}: ${day.contributionCount}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>
