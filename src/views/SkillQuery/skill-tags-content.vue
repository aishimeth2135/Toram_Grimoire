<template>
  <div v-if="currentTag" class="skill-tag-content-wrapper">
    <div class="skill-tag-content">
      <div class="mb-1 flex items-center">
        <cy-button-icon
          v-if="tags.length > 1"
          icon="ic:round-arrow-back"
          :disabled="currentTagIdx === 0"
          @click.stop="goPreviousTag"
        />
        <cy-icon-text icon="ri-leaf-fill" text-color="purple">
          {{ currentTag.name }}
        </cy-icon-text>
        <cy-button-icon
          v-if="tags.length > 1"
          icon="ic:round-arrow-forward"
          class="ml-auto"
          :disabled="currentTagIdx === tags.length - 1"
          @click.stop="goNextTag"
        />
      </div>
      <div class="px-2">
        <template v-for="frame in currentTag.frames" :key="frame.type + frame.value.join(',')">
          <div
            v-if="frame.type === 'category'"
            class="my-2"
          >
            <cy-icon-text icon="ic-baseline-label" small>
              {{ frame.value[0] }}
            </cy-icon-text>
          </div>
          <div
            v-else-if="frame.type === 'caption'"
            class="py-1"
            v-html="handleText(frame.value[0])"
          />
          <div
            v-else-if="frame.type === 'list'"
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
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs, ref, watch } from 'vue'

import { markText } from '@/shared/utils/view'

import Tag from '@/lib/Tag/Tag'

import { createTagButtons } from './utils'

interface Props {
  tags: Tag[];
}

const props = defineProps<Props>()

const { tags } = toRefs(props)

const currentTagIdx = ref(0)
const currentTag = computed(() => {
  if (tags.value.length === 0) {
    return null
  }
  return tags.value[currentTagIdx.value]
})

watch(tags, (value) => {
  currentTagIdx.value = value.length - 1
}, { deep: true })

const handleText = (html: string) => {
  html = markText(html)
  html = html.replace(/\(\(((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="bracket-text">${p1}</span>`)
  html = createTagButtons(html)
  return html
}

const goPreviousTag = () => {
  currentTagIdx.value -= 1
}
const goNextTag = () => {
  currentTagIdx.value += 1
}
</script>

<style lang="postcss" scoped>
.skill-tag-content-wrapper {
  @apply bg-white bg-opacity-95 border border-b-0 border-light-2 shadow-sm mx-2;

  max-width: 30rem;
  min-width: 12.5rem;
  /* max-height: calc(47vh - 3rem); */

  & > .skill-tag-content {
    @apply border-b border-light-2 p-4 pb-0;

    &::after {
      content: '';
      @apply block sticky h-4 bottom-0 bg-white bg-opacity-60;
      border-radius: 20% 20% 0 0;
    }
  }
  &:deep(.bracket-text) {
    @apply border-l-1 border-r-1 border-current mx-2 px-2 text-light-4;
  }

  &:deep(.click-button--tag) {
    @apply text-orange cursor-pointer inline-block px-0.5;
  }
}
</style>
