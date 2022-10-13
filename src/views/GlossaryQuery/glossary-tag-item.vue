<template>
  <div class="py-0.5" :class="{ 'bg-white': detailVisible }">
    <div>
      <cy-list-item @click="detailVisible = !detailVisible">
        <cy-icon-text
          icon="mdi:tag-outline"
          :text-color="!sub ? 'primary-80' : 'orange-60'"
        >
          {{ tag.name }}
        </cy-icon-text>
        <div class="ml-3 flex items-center space-x-1.5 text-sm text-primary-30">
          <div v-for="row in categoryRows" :key="row.value.join(',')">
            {{ row.value[0] }}
          </div>
        </div>
      </cy-list-item>
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="pb-2">
        <div class="space-y-2.5 py-1 pl-6 pr-4">
          <template
            v-for="row in infoRows"
            :key="row.type + row.value.join(',')"
          >
            <div
              v-if="row.type === 'caption'"
              v-html="handleText(row.value[0])"
            />
            <div v-else-if="row.type === 'list'">
              <div
                v-for="rowValue in row.value"
                :key="rowValue"
                class="flex items-start py-0.5"
              >
                <cy-icon-text icon="jam:leaf" class="mr-2" icon-width="1rem" />
                <div v-html="handleText(rowValue)" />
              </div>
            </div>
          </template>
        </div>
        <div
          v-if="otherTags.length > 0"
          class="divide-light my-2 ml-2 divide-y border-l-2 border-primary-50"
        >
          <GlossaryTagItem
            v-for="otherTag in otherTags"
            :key="otherTag.name"
            :tag="otherTag"
            sub
          />
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
  tag: GlossaryTag
  sub?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sub: false,
})

const detailVisible = ref(false)

const categoryRows = computed(() =>
  props.tag.rows.filter(row => row.type === 'category')
)
const infoRows = computed(() =>
  props.tag.rows.filter(row => row.type === 'caption' || row.type === 'list')
)

const handleText = (html: string) => {
  html = markText(html)
  html = html.replace(
    /\(\(((?:(?!\(\().)+)\)\)/g,
    (match, p1) => `<span class="bracket-text">${p1}</span>`
  )
  html = createTagButtons(html)
  return html
}

const otherTags = computed(() => (props.sub ? [] : searchTags(props.tag)))
</script>

<style lang="postcss" scoped>
:deep(.click-button--tag) {
  @apply text-orange-60;
}

:deep(.bracket-text) {
  @apply mx-2 border-l-1 border-r-1 border-current px-2 text-primary-60;
}
</style>
