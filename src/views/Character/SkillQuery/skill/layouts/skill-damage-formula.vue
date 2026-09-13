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
  margin-inline: --spacing(2);
  border-left-width: 2px;
  border-color: var(--color-primary-30);
  height: --spacing(6);
}

.attr-item {
  display: inline-flex;
  align-items: center;
  margin-block: --spacing(1);
  padding-inline: --spacing(1.5);
  padding-block: --spacing(0.5);
}

.damage-formula-main > .damage-formula-main-first + .divider {
  margin-left: --spacing(0.5);
}

.damage-formula-main > .damage-formula-main-first + .attr-item {
  padding-left: --spacing(0);
}
</style>
