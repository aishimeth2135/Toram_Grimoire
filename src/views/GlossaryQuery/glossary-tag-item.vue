<template>
  <CardRow :selected="detailVisible">
    <div
      class="hover:bg-primary-5 flex cursor-pointer items-center px-3.5 py-2.5 duration-150"
      @click="detailVisible = !detailVisible"
    >
      <div
        class="gap-icon inline-flex items-center"
        :class="!sub ? 'text-primary-80' : 'text-orange-60'"
      >
        <cy-icon icon="mdi:tag-outline" class="text-primary-30" />
        {{ tag.name }}
      </div>
      <div class="text-primary-30 ml-3 flex items-center space-x-1.5 text-sm">
        <div v-for="row in categoryRows" :key="row.value.join(',')">
          {{ row.value[0] }}
        </div>
      </div>
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="bg-white pb-2.5 pl-3.5 pr-2">
        <GlossaryTagContentRows class="py-2 pl-6 pr-4" :tag="tag" />
        <div v-if="includedTags.length > 0">
          <CardRows class="border-primary-30 border-l-4">
            <GlossaryTagItem
              v-for="otherTag in includedTags"
              :key="otherTag.name"
              :tag="otherTag"
              sub
            />
          </CardRows>
        </div>
      </div>
    </cy-transition>
  </CardRow>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { GlossaryTag } from '@/lib/Glossary/GlossaryTag'

import CardRow from '@/components/card/card-row.vue'
import CardRows from '@/components/card/card-rows.vue'

import GlossaryTagContentRows from './glossary-tag-content-rows.vue'

interface Props {
  tag: GlossaryTag
  sub?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sub: false,
})

const detailVisible = ref(false)

const categoryRows = computed(() => props.tag.rows.filter(row => row.type === 'category'))

const includedTags = computed(() => (props.sub ? [] : Grimoire.Glossary.getIncludedTags(props.tag)))
</script>
