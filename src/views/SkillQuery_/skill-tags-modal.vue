<template>
  <cy-detail-window
    v-if="currentTag || (currentTag && visible)"
    :position-element="positionElement"
  >
    <div class="skill-tag-modal-content" @click="emit('update:visible', false)">
      <div class="mb-1 flex items-center">
        <!-- <cy-button
          v-if="tagState.tags.length > 1"
          icon="jam-arrow-left"
          type="inline"
          @click.stop="previousTag"
        /> -->
        <cy-icon-text icon="ri-leaf-fill" text-color="purple">
          {{ currentTag.name }}
        </cy-icon-text>
        <span v-if="visible" class="ml-auto text-sm text-water-blue">
          {{ t('skill-query.click anywhere to close') }}
        </span>
      </div>
      <div class="px-2">
        <template v-for="frame in currentTag.frames" :key="frame.type + frame.value">
          <div
            v-if="frame.type === 'category'"
            class="my-2"
          >
            <cy-icon-text icon="ic-baseline-label" size="small">
              {{ frame.value }}
            </cy-icon-text>
          </div>
          <div
            v-else-if="frame.type === 'caption' && typeof frame.value === 'string'"
            class="py-1"
            v-html="handleText(frame.value)"
          />
          <div
            v-else-if="frame.type === 'list' && Array.isArray(frame.value)"
            class="mt-2"
          >
            <div v-for="frameValue in frame.value" :key="frameValue" class="flex items-start py-0.5">
              <cy-icon-text
                icon="jam:leaf"
                class="mr-2"
                icon-width="1rem"
              />
              <div v-html="handleText(frameValue)" />
            </div>
          </div>
        </template>
      </div>
    </div>
  </cy-detail-window>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { computed, toRefs } from 'vue';

import { markText } from '@/shared/utils/view';

import Tag from '@/lib/Tag/Tag';


interface Props {
  tags: Tag[];
  visible: boolean;
  positionElement: HTMLElement | null;
}

interface Emits {
  (evt: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

const { tags } = toRefs(props);

const currentTag = computed(() => {
  if (tags.value.length === 0) {
    return null;
  }
  return tags.value[tags.value.length - 1];
});

const handleText = (html: string) => {
  html = markText(html);
  html = html.replace(/\(\(((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="bracket-text">${p1}</span>`);
  return html;
};
</script>

<style lang="postcss" scoped>
.skill-tag-modal-content {
  &:deep(.bracket-text) {
    @apply border-l-1 border-r-1 border-current mx-2 px-2 text-light-4;
  }
}
</style>
