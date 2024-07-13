<template>
  <div class="text-content" :class="rootClassList" @click="rootClicked">
    <cy-icon
      v-if="branchItem.is(SkillBranchNames.Tips)"
      icon="ic:outline-tips-and-updates"
      class="ml-1 mr-2 mt-0.5"
    />
    <SkillBranchPropValue :result="container.result('text')" />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import { SkillBranchNames } from '@/lib/Skill/Skill'
import {
  SkillBranchItem,
  SkillComputingContainer,
} from '@/lib/Skill/SkillComputing'

import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'

import TextHandler from './branch-handlers/TextHandler'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => TextHandler(props.computing, branchItem.value))

if (branchItem.value.isGroup) {
  // not toggle, init only
  branchItem.value.toggleGroupExpanded(
    true,
    branchItem.value.groupState.expanded
  )
}

const rootClicked = () => {
  if (branchItem.value.isGroup) {
    branchItem.value.toggleGroupExpanded(true)
  }
}

const rootClassList = computed(() => {
  return {
    'is-tips': branchItem.value.is(SkillBranchNames.Tips),
    'is-mark': branchItem.value.propBoolean('is_mark'),
    'is-group': branchItem.value.isGroup,
    'group-active': branchItem.value.groupState.expanded,
  }
})
</script>

<style lang="postcss" scoped>
.text-content {
  @apply flex w-full items-start px-3 py-1;

  &.is-tips {
    @apply pl-5 text-sm;

    /* APPLY text-primary-50 */
    color: var(--app-primary-50);

    & :deep(.text-primary-50) {
      color: var(--app-fuchsia-60);
    }
  }

  &.is-mark {
    @apply border-1 border-l-3 border-primary-50 px-4 py-3;
  }

  &.is-group {
    @apply relative my-2 cursor-pointer border-1 border-primary-30 px-5 py-2 duration-300;

    &.group-active {
      @apply border-primary-50;
      border-left-color: transparent;
      border-right-color: transparent;
      border-bottom-color: transparent;

      &::after {
        @apply hidden;
      }
    }

    &:hover {
      @apply border-primary-60;

      &::before {
        @apply bg-primary-60;
      }
    }

    &::before,
    &::after {
      content: '';
      @apply absolute h-4 w-4 bg-primary-50;
    }
    &::before {
      @apply -left-2 -top-2;
    }
    &::after {
      @apply -bottom-2 -right-2;
    }
  }
}
</style>
