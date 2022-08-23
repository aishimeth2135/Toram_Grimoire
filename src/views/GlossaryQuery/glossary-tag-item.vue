<template>
  <div class="py-0.5" :class="{ 'bg-white': detailVisible }">
    <div>
      <cy-list-item @click="detailVisible = !detailVisible">
        <cy-icon-text icon="mdi:tag-outline" :text-color="!sub ? 'dark-light' : 'orange'">
          {{ tag.name }}
        </cy-icon-text>
        <div class="flex items-center ml-3 space-x-1.5 text-light-2 text-sm">
          <div v-for="row in categoryRows" :key="row.value.join(',')">
            {{ row.value[0] }}
          </div>
        </div>
      </cy-list-item>
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="pb-2">
        <div class="pl-6 pr-4 py-1 space-y-2.5">
          <template v-for="row in infoRows" :key="row.type + row.value.join(',')">
            <div
              v-if="row.type === 'caption'"
              v-html="handleText(row.value[0])"
            />
            <div v-else-if="row.type === 'list'">
              <div v-for="rowValue in row.value" :key="rowValue" class="flex items-start py-0.5">
                <cy-icon-text
                  icon="jam:leaf"
                  class="mr-2"
                  icon-width="1rem"
                />
                <div v-html="handleText(rowValue)" />
              </div>
            </div>
          </template>
        </div>
        <div v-if="otherTags.length > 0" class="my-2 ml-2 divide-y divide-light border-l-2 border-light-3">
          <GlossaryTagItem v-for="otherTag in otherTags" :key="otherTag.name" :tag="otherTag" sub />
        </div>
      </div>
    </cy-transition>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GlossaryTagItem',
}
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import { markText } from '@/shared/utils/view'

import GlossaryTag from '@/lib/Glossary/GlossaryTag'

import { createTagButtons, searchTags } from '@/views/SkillQuery/utils'

interface Props {
  tag: GlossaryTag;
  sub?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sub: false,
})

const detailVisible = ref(false)

const categoryRows = computed(() => props.tag.rows.filter(row => row.type === 'category'))
const infoRows = computed(() => props.tag.rows.filter(row => row.type === 'caption' || row.type === 'list'))

const handleText = (html: string) => {
  html = markText(html)
  html = html.replace(/\(\(((?:(?!\(\().)+)\)\)/g, (match, p1) => `<span class="bracket-text">${p1}</span>`)
  html = createTagButtons(html)
  return html
}

const otherTags = computed(() => props.sub ? [] : searchTags(props.tag))
</script>

<style lang="postcss" scoped>
:deep(.click-button--tag) {
  @apply text-orange;
}

:deep(.bracket-text) {
  @apply border-l-1 border-r-1 border-current mx-2 px-2 text-light-4;
}
</style>
