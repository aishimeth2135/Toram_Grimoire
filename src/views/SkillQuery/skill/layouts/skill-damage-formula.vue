<template>
  <div>
    <div class="damage-formula-main inline-flex flex-wrap items-center">
      <div class="damage-formula-main-first" />
      <span
        v-if="container.has('extra_constant') && frequencyVisible"
        class="divider border-orange-60"
      />
      <span v-if="container.has('constant')" class="divider" />
      <span v-if="container.has('base')" class="attr-item">
        {{ container.get('base') }}
      </span>
      <template v-if="container.has('constant')">
        <cy-icon v-if="container.has('base')" icon="ic-round-add" />
        <SkillBranchPropValue class="attr-item" :result="container.result('constant')" />
        <span class="divider" />
      </template>
      <cy-icon icon="ic-round-close" />
      <SkillBranchPropValue class="attr-item" :result="container.result('multiplier')" />
      <template v-if="container.has('extra_constant')">
        <cy-icon icon="ic-round-add" />
        <SkillBranchPropValue class="attr-item" :result="container.result('extra_constant')" />
        <span v-if="frequencyVisible" class="divider border-orange-60" />
      </template>
      <cy-icon v-if="frequencyVisible && container.has('frequency')" icon="ic-round-close" />
      <SkillBranchPropValue
        v-if="frequencyVisible"
        class="attr-item"
        :result="container.result('frequency')"
      />
    </div>
    <div v-if="container.has('@custom-base-caption')" class="mb-1.5 mt-1 text-sm">
      <div class="text-orange-60">
        {{ container.get('base') }}
      </div>
      <SkillBranchPropValue
        class="text-primary-50"
        :result="container.result('@custom-base-caption')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import SkillBranchPropValue from './skill-branch-prop-value.vue'

import DisplayDataContainer from '../branch-handlers/handle/DisplayDataContainer'

interface Props {
  container: DisplayDataContainer
}

const props = defineProps<Props>()

const { container } = toRefs(props)

const frequencyVisible = computed(() => {
  return container.value.branchItem.prop('title') === 'each'
})
</script>

<style scoped>
@reference "@/tailwind.css";

.divider {
  @apply border-primary-30 mx-2 h-6 border-l-2;
}

.attr-item {
  @apply my-1 inline-flex items-center px-1.5 py-0.5;
}

.damage-formula-main > .damage-formula-main-first + .divider {
  @apply ml-0.5;
}

.damage-formula-main > .damage-formula-main-first + .attr-item {
  @apply pl-0;
}
</style>
