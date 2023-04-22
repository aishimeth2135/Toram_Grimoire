<template>
  <CardRow :selected="detailVisible">
    <div
      class="flex cursor-pointer items-center px-3.5 py-2.5 duration-150 hover:bg-primary-5"
      @click="detailVisible = !detailVisible"
    >
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
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="bg-white pb-4 pl-3.5 pr-2">
        <GlossaryTagContentRows class="py-2 pl-6 pr-4" :tag="tag" />
        <div v-if="includedTags.length > 0">
          <CardRows class="border-l-2 border-primary-30">
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

<script lang="ts">
export default {
  name: 'GlossaryTagItem',
}
</script>

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

const categoryRows = computed(() =>
  props.tag.rows.filter(row => row.type === 'category')
)

const includedTags = computed(() =>
  props.sub ? [] : Grimoire.Glossary.getIncludedTags(props.tag)
)
</script>
