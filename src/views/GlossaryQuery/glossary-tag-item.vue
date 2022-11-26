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
        <GlossaryTagContentRows class="py-2 pl-6 pr-4" :tag="tag" />
        <div
          v-if="includedTags.length > 0"
          class="my-2 ml-2 divide-y divide-primary-20 border-l-2 border-primary-50"
        >
          <GlossaryTagItem
            v-for="otherTag in includedTags"
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

import Grimoire from '@/shared/Grimoire'

import GlossaryTag from '@/lib/Glossary/GlossaryTag'

import GlossaryTagContentRows from './glossary-tag-content-rows.vue'

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

const includedTags = computed(() =>
  props.sub ? [] : Grimoire.Glossary.getIncludedTags(props.tag)
)
</script>
