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
      <cy-icon-text
        v-if="container.has('base') && container.has('constant')"
        icon="ic-round-add"
      />
      <SkillBranchPropValue
        class="attr-item"
        :result="container.result('constant')"
      />
      <span v-if="container.has('constant')" class="divider" />
      <cy-icon-text icon="ic-round-close" />
      <SkillBranchPropValue
        class="attr-item"
        :result="container.result('multiplier')"
      />
      <cy-icon-text
        v-if="container.has('extra_constant')"
        icon="ic-round-add"
      />
      <SkillBranchPropValue
        class="attr-item"
        :result="container.result('extra_constant')"
      />
      <span
        v-if="container.has('extra_constant') && frequencyVisible"
        class="divider border-orange-60"
      />
      <cy-icon-text
        v-if="frequencyVisible && container.has('frequency')"
        icon="ic-round-close"
      />
      <SkillBranchPropValue
        v-if="frequencyVisible"
        class="attr-item"
        :result="container.result('frequency')"
      />
    </div>
    <div
      v-if="container.has('@custom-base-caption')"
      class="mb-2.5 flex flex-wrap items-center pl-2"
    >
      <cy-icon-text text-color="fuchsia-60" small class="mt-1">
        {{ container.get('base') }}
      </cy-icon-text>
      <div
        class="mt-1 pl-3 text-sm text-primary-50"
        v-html="container.get('@custom-base-caption')"
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

<style lang="postcss" scoped>
.divider {
  @apply mx-2 h-6 border-l-1 border-primary-30;
}

.attr-item {
  @apply my-1 inline-flex items-center py-0.5 px-1.5;
}

.damage-formula-main > .damage-formula-main-first + .divider {
  @apply ml-0.5;
}

.damage-formula-main > .damage-formula-main-first + .attr-item {
  @apply pl-0;
}
</style>
