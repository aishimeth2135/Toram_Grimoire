<template>
  <cy-popover
    v-if="currentTag"
    tag="span"
    class="inline-block px-0.5"
    show-triggers="click hover"
  >
    <span class="cursor-pointer text-orange-60 underline">
      {{ displayName ?? name }}
    </span>
    <template #popper>
      <GlossaryTagContent :tag="currentTag" />
    </template>
  </cy-popover>
  <span v-else class="text-orange-60">
    {{ displayName ?? name }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import Grimoire from '@/shared/Grimoire'

import GlossaryTagContent from './glossary-tag-content.vue'

interface Props {
  name: string
  displayName?: string
}

const props = defineProps<Props>()

const currentTag = computed(() => Grimoire.Glossary.getTagByName(props.name))
</script>
