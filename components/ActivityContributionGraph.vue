<script setup lang="ts">
import type { ContributionData } from '~/types/blog';

defineProps<{
  data?: ContributionData | null;
}>();

// GitHub 热力图配色（5 级）
const colorLevels = [
  '#ebedf0', // level 0 - 无数据
  '#9be9a8', // level 1 - 较少
  '#40c463', // level 2 - 一般
  '#30a14e', // level 3 - 较多
  '#216e39', // level 4 - 最多
];

const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const monthLabels = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function getContributionLevel(count: number) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
}

function getMonthLabel(weekIndex: number, days: { date: string; contributionCount: number }[]) {
  // 取每周第一天的月份标签，避免重复显示同一个月
  if (days.length === 0) return '';
  const firstDay = new Date(days[0].date);
  const dayOfWeek = firstDay.getDay(); // 0=Sun
  // 只在周一或每月1-3号时显示月份名
  const dayOfMonth = firstDay.getDate();
  if (dayOfMonth > 3) return '';
  // 如果不是本周第一天（从周日算），不显示以对齐
  if (dayOfWeek !== 1 && dayOfWeek !== 2 && dayOfWeek !== 0) {
    // 对于周日起始的第一列，如果日期是月初也显示
    if (dayOfWeek !== 0 || dayOfMonth > 2) return '';
  }
  return monthLabels[firstDay.getMonth()];
}

const hoveredCell = ref<{ x: number; y: number; date: string; count: number } | null>(null);

function onCellHover(e: MouseEvent, date: string, count: number) {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  hoveredCell.value = {
    x: rect.left + rect.width / 2,
    y: rect.top,
    date,
    count,
  };
}

function onCellLeave() {
  hoveredCell.value = null;
}
</script>

<template>
  <div v-if="data" class="blog-panel p-6">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm font-medium text-[var(--blog-subtle)]">{{ data.totalContributions }} contributions in the last year</p>
      <div class="flex items-center gap-2 text-xs text-[var(--blog-subtle)]">
        <span>Less</span>
        <div class="flex gap-[3px]">
          <span
            v-for="(color, i) in colorLevels"
            :key="i"
            class="h-[10px] w-[10px] rounded-sm"
            :style="{ backgroundColor: color }"
          />
        </div>
        <span>More</span>
      </div>
    </div>

    <!-- GitHub 风格热力图 -->
    <div class="overflow-x-auto pb-2" @mouseleave="onCellLeave">
      <div class="relative inline-flex min-w-max gap-[3px]" style="padding-left: 36px;">
        <!-- 星期标签（左侧） -->
        <div class="pointer-events-none absolute left-0 top-0 flex h-full w-[28px] flex-col gap-[3px] py-0">
          <template v-for="(label, i) in dayLabels" :key="i">
            <div
              class="flex items-center text-[9.5px] leading-none text-[var(--blog-subtle)]"
              style="height: 11px;"
            >
              {{ label }}
            </div>
          </template>
        </div>

        <!-- 周列 + 月份标签 -->
        <div class="flex gap-[3px]">
          <div v-for="(week, weekIndex) in data.weeks" :key="weekIndex" class="flex flex-col gap-[3px]">
            <!-- 月份标签行（每列第一个） -->
            <div
              v-if="getMonthLabel(weekIndex, week.contributionDays)"
              class="mb-0.5 text-[9.5px] font-normal text-[var(--blog-subtle)] leading-none"
              style="height: 15px;"
            >
              {{ getMonthLabel(weekIndex, week.contributionDays) }}
            </div>
            <div v-else style="height: 15px;" />

            <!-- 每天的格子 -->
            <div
              v-for="(day, dayIndex) in week.contributionDays"
              :key="`${weekIndex}-${dayIndex}`"
              class="h-[11px] w-[11px] cursor-pointer rounded-[2px] ring-1 ring-black/[0.06] transition-all duration-100 hover:ring-2 hover:ring-black/[0.20]"
              :style="{ backgroundColor: colorLevels[getContributionLevel(day.contributionCount)] }"
              :title="`${day.date}: ${day.contributionCount} contributions`"
              @mouseenter="onCellHover($event, day.date, day.contributionCount)"
              @mouseleave="onCellLeave"
            />
          </div>
        </div>
      </div>

      <!-- 浮动 Tooltip -->
      <Teleport to="body">
        <Transition name="tooltip-fade">
          <div
            v-if="hoveredCell"
            class="fixed z-[9999] rounded-[6px] border border-[var(--blog-border-strong)] bg-white px-3 py-2 shadow-lg"
            :style="{ top: `${hoveredCell.y - 42}px`, left: `${hoveredCell.x}px`, transform: 'translateX(-50%)' }"
          >
            <p class="text-xs font-semibold text-[var(--blog-ink)]">{{ hoveredCell.count }} {{ hoveredCell.count === 1 ? 'contribution' : 'contributions' }}</p>
            <p class="mt-0.5 text-[10px] text-[var(--blog-subtle)]">{{ hoveredCell.date }}</p>
            <!-- 小三角箭头 -->
            <div class="absolute bottom-[-4px] left-1/2 h-2 w-2 translate-x-1/2 rotate-45 border-b border-r border-[var(--blog-border-strong)] bg-white" />
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.12s ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
