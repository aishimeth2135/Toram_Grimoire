<template>
  <div class="pb-2.5" :class="sub ? 'pt-2.5' : 'pt-4'">
    <div class="px-4">
      <div
        class="text-primary-70 relative flex items-center pl-3"
        :class="{ 'cursor-pointer': sub }"
        @click="detailVisible = !detailVisible"
      >
        <span>{{ tag.name }}</span>
        <span v-if="categoryRow" class="text-primary-30 ml-3 text-sm">
          {{ categoryRow.value[0] }}
        </span>
        <cy-icon
          v-if="sub"
          :icon="detailVisible ? 'ic:round-keyboard-arrow-down' : 'ic:round-keyboard-arrow-up'"
          class="ml-4"
        />
        <cy-icon
          v-if="!sub"
          icon="ic:round-label"
          class="text-primary-20 absolute -left-5 top-0"
          width="1.45rem"
        />
      </div>
      <GlossaryTagContentRows
        v-if="!sub || detailVisible"
        class="pb-3.5 pl-3 pr-4 pt-3"
        :tag="tag"
      />
    </div>
    <div
      v-if="includedTags.length > 0"
      class="divide divide-primary-10 border-primary-20 divide-y-2 border-t"
    >
      <GlossaryTagContent v-for="tag in includedTags" :key="tag.name" :tag="tag" sub />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { GlossaryTag } from '@/lib/Glossary/GlossaryTag'

import GlossaryTagContentRows from './glossary-tag-content-rows.vue'

interface Props {
  tag: GlossaryTag
  sub?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sub: false,
})

const detailVisible = ref(false)

const categoryRow = computed(() => props.tag.rows.find(row => row.type === 'category'))

const includedTags = computed(() => (props.sub ? [] : Grimoire.Glossary.getIncludedTags(props.tag)))
</script>
