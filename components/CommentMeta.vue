<script setup lang="ts">
const props = withDefaults(defineProps<{
  browserLabel?: string | null;
  osLabel?: string | null;
  userAgent?: string | null;
  countryName?: string | null;
  compact?: boolean;
  showBrowser?: boolean;
  showCountry?: boolean;
}>(), {
  browserLabel: null,
  osLabel: null,
  userAgent: null,
  countryName: null,
  compact: false,
  showBrowser: true,
  showCountry: true,
});

const hasBrowserInfo = computed(() =>
  props.browserLabel && props.browserLabel.trim() !== '' && props.browserLabel.trim() !== 'Unknown browser'
);

const browserText = computed(() => {
  if (!hasBrowserInfo.value) return '';
  const parts = [props.browserLabel!.trim()];
  const os = props.osLabel?.trim();
  if (os && os !== 'Unknown OS') {
    parts.push(os);
  }
  return parts.join(' / ');
});

const countryText = computed(() => props.countryName?.trim() || '');

// 浏览器图标文件名映射（匹配 public/img/browser-icons/ 下的实际文件名）
const browserIconFile = computed(() => {
  const label = (props.browserLabel || '').toLowerCase();
  if (label.includes('brave')) return 'logos_brave';
  if (label.includes('edge')) return 'logos_microsoft-edge';
  if (label.includes('firefox')) return 'logos_firefox';
  if (label.includes('safari')) return 'logos_safari';
  if (label.includes('opera')) return 'logos_opera';
  if (label.includes('chrome') || label.includes('chromium')) return 'logos_chrome';
  if (label.includes('internet explorer')) return 'logos_internetexplorer';
  return null;
});
</script>

<template>
  <div class="comment-meta" :class="{ 'comment-meta-compact': compact }">
    <span
      v-if="hasBrowserInfo"
      class="comment-meta-chip comment-meta-browser"
      :title="userAgent || browserText"
    >
      <img
        v-if="browserIconFile"
        class="comment-meta-icon"
        :src="`/img/browser-icons/${browserIconFile}.svg`"
        :alt="browserLabel || ''"
        aria-hidden="true"
      />
      <img
        v-else
        class="comment-meta-icon"
        src="/img/icons/lucide_monitor.svg"
        alt="Unknown browser"
        aria-hidden="true"
      />
      <span class="comment-meta-text">{{ browserText }}</span>
    </span>
    <span v-if="showCountry && countryText" class="comment-meta-chip comment-meta-country" :title="countryText">
      <img
        class="comment-meta-icon"
        src="/img/icons/lucide_map-pin.svg"
        alt="Location"
        aria-hidden="true"
      />
      <span class="comment-meta-text">来自：{{ countryText }}</span>
    </span>
  </div>
</template>

<style scoped>
.comment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  color: var(--blog-subtle, #64748b);
}

.comment-meta-chip {
  display: inline-flex;
  min-height: 1.6rem;
  max-width: 16rem;
  align-items: center;
  gap: 0.4rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--blog-border, #e2e8f0) 82%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--blog-soft, #f8fafc) 82%, #ffffff);
  padding: 0.16rem 0.58rem;
  font-size: 0.6875rem;
  line-height: 1;
  white-space: nowrap;
}

.comment-meta-browser {
  color: color-mix(in srgb, var(--blog-muted, #475569) 84%, #2563eb);
}

.comment-meta-country {
  border-color: color-mix(in srgb, var(--blog-border, #e2e8f0) 70%, #16a34a);
  background: color-mix(in srgb, var(--blog-soft, #f8fafc) 88%, #ecfdf5);
  color: color-mix(in srgb, var(--blog-muted, #475569) 78%, #15803d);
}

.comment-meta-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem; /* emoji 大小 */
}

.comment-meta-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.comment-meta-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.comment-meta-compact .comment-meta-chip {
  min-height: 1.45rem;
  max-width: 12rem;
  padding: 0.12rem 0.48rem;
}
</style>
