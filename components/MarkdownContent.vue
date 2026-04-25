<script setup lang="ts">
import { renderMarkdown } from '~/composables/api';
import { enhanceMarkdownCodeBlocks } from '~/utils/markdown-code-blocks';

const props = defineProps<{
  content: string;
  copyCodeBlocks?: boolean;
}>();

const html = computed(() => renderMarkdown(props.content));
const rootRef = ref<HTMLElement | null>(null);
const lightboxImages = ref<Array<{ src: string; alt: string; title: string }>>([]);
const activeImageIndex = ref<number | null>(null);

const activeImage = computed(() => {
  return activeImageIndex.value === null ? null : lightboxImages.value[activeImageIndex.value] ?? null;
});

const hasPreviousImage = computed(() => activeImageIndex.value !== null && activeImageIndex.value > 0);
const hasNextImage = computed(() => activeImageIndex.value !== null && activeImageIndex.value < lightboxImages.value.length - 1);

function openImageLightbox(index: number) {
  if (!lightboxImages.value[index]) {
    return;
  }

  activeImageIndex.value = index;
}

function closeImageLightbox() {
  activeImageIndex.value = null;
}

function showPreviousImage() {
  if (activeImageIndex.value === null || activeImageIndex.value <= 0) {
    return;
  }

  activeImageIndex.value -= 1;
}

function showNextImage() {
  if (activeImageIndex.value === null || activeImageIndex.value >= lightboxImages.value.length - 1) {
    return;
  }

  activeImageIndex.value += 1;
}

function enhanceCodeBlocks() {
  if (import.meta.server || !props.copyCodeBlocks || !rootRef.value) {
    return;
  }
  enhanceMarkdownCodeBlocks(rootRef.value);
}

function enhanceImages() {
  if (import.meta.server || !rootRef.value) {
    return;
  }

  const images = Array.from(rootRef.value.querySelectorAll<HTMLImageElement>('img'));
  lightboxImages.value = images
    .map((image) => ({
      src: image.currentSrc || image.src,
      alt: image.alt || '',
      title: image.title || '',
    }))
    .filter((image) => image.src);

  images.forEach((image, index) => {
    image.dataset.lightboxIndex = String(index);
    image.dataset.lightboxEnhanced = 'true';
    image.classList.add('markdown-lightbox-trigger');
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', image.alt ? `Open image: ${image.alt}` : 'Open image');

    image.onclick = () => {
      openImageLightbox(index);
    };

    image.onkeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      openImageLightbox(index);
    };
  });
}

function handleWindowKeydown(event: KeyboardEvent) {
  if (activeImageIndex.value === null) {
    return;
  }

  if (event.key === 'Escape') {
    closeImageLightbox();
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    showPreviousImage();
    return;
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    showNextImage();
  }
}

watch(
  html,
  async () => {
    await nextTick();
    enhanceCodeBlocks();
    enhanceImages();
  },
  { immediate: true },
);

watch(activeImageIndex, (value) => {
  if (import.meta.server) {
    return;
  }

  document.body.style.overflow = value === null ? '' : 'hidden';
});

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <div ref="rootRef" class="article-content px-6 py-8 md:px-10 md:py-12" v-html="html" />

  <Teleport to="body">
    <div
      v-if="activeImage"
      class="markdown-lightbox"
      @click.self="closeImageLightbox"
    >
      <button class="markdown-lightbox__close" type="button" aria-label="Close image viewer" @click="closeImageLightbox">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.36a1 1 0 1 1 1.414 1.413L13.414 10.586l4.361 4.36a1 1 0 0 1-1.414 1.415L12 12l-4.361 4.36a1 1 0 0 1-1.414-1.414l4.36-4.36-4.36-4.36a1 1 0 0 1 0-1.415Z" />
        </svg>
      </button>

      <button
        v-if="hasPreviousImage"
        class="markdown-lightbox__nav markdown-lightbox__nav--prev"
        type="button"
        aria-label="Show previous image"
        @click="showPreviousImage"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.78 5.97a.75.75 0 0 1 0 1.06L9.81 12l4.97 4.97a.75.75 0 1 1-1.06 1.06l-5.5-5.5a.75.75 0 0 1 0-1.06l5.5-5.5a.75.75 0 0 1 1.06 0Z" />
        </svg>
      </button>

      <figure class="markdown-lightbox__figure">
        <img
          :src="activeImage.src"
          :alt="activeImage.alt"
          class="markdown-lightbox__image"
        >
        <figcaption v-if="activeImage.alt || activeImage.title" class="markdown-lightbox__caption">
          {{ activeImage.alt || activeImage.title }}
        </figcaption>
      </figure>

      <button
        v-if="hasNextImage"
        class="markdown-lightbox__nav markdown-lightbox__nav--next"
        type="button"
        aria-label="Show next image"
        @click="showNextImage"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.22 5.97a.75.75 0 0 1 1.06 0l5.5 5.5a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 1 1-1.06-1.06L14.19 12 9.22 7.03a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>

      <div v-if="lightboxImages.length > 1 && activeImageIndex !== null" class="markdown-lightbox__counter">
        {{ activeImageIndex + 1 }} / {{ lightboxImages.length }}
      </div>
    </div>
  </Teleport>
</template>
