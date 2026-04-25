<script setup lang="ts">
const props = withDefaults(defineProps<{
  browserLabel?: string | null;
}>(), {
  browserLabel: null,
});

const svgMap: Record<string, string> = {
  brave: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 301"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 2.4c4.1 0 7.5 1.4 10.2 4.2C14.9 6.2 8.4 7.8 3.6 10.8c-1.2 5.8-1.8 11.5-1.8 17.2 0 2.4.2 4.8.6 7.2C6.8 36.2 12 44.4 12 44.4s5.2-8.2 9.6-9.6c.4-2.4.6-4.8.6-7.2 0-5.7-.6-11.4-1.8-17.2C15.5 7.8 9 6.2 1.8 6.6c2.7-2.8 6.1-4.2 10.2-4.2z" fill="#fb542b"/></svg>',
  edge: '',
  firefox: '',
  safari: '',
  opera: '',
  chrome: '',
  ie: '',
};

const svgContent = computed(() => {
  const label = (props.browserLabel || '').toLowerCase();
  let key = '';
  if (label.includes('brave')) key = 'brave';
  else if (label.includes('edge')) key = 'edge';
  else if (label.includes('firefox')) key = 'firefox';
  else if (label.includes('safari')) key = 'safari';
  else if (label.includes('opera')) key = 'opera';
  else if (label.includes('chrome') || label.includes('chromium')) key = 'chrome';
  else if (label.includes('internet explorer')) key = 'ie';
  
  return key && svgMap[key] ? svgMap[key] : null;
});
</script>

<template>
  <span v-if="svgContent" class="comment-meta-icon shrink-0" v-html="svgContent" />
  <span v-else class="comment-meta-icon shrink-0">
    <Icon name="lucide:monitor" aria-hidden="true" />
  </span>
</template>

<style scoped>
.comment-meta-icon {
  width: 0.9rem;
  height: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
