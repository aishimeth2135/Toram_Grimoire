<template>
  <div
    class="text-content"
    :class="rootClassList"
    @click="rootClicked"
  >
    <cy-icon-text
      v-if="branchItem.is(SkillBranchNames.Tips)"
      icon="ic:outline-tips-and-updates"
      class="mr-2 mt-0.5"
    />
    <div v-html="container.get('text')"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import SkillComputingContainer, { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import TextHandler from './branch-handlers/TextHandler'

interface Props {
  computing: SkillComputingContainer;
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => TextHandler(props.computing, branchItem.value))

if (branchItem.value.isGroup) {
  // not toggle, init only
  branchItem.value.toggleGroupExpanded(true, branchItem.value.groupState.expanded)
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
  @apply px-3 py-1 w-full flex items-start;

  &.is-tips {
    @apply text-sm pl-5;

    /* APPLY text-primary-50 */
    color: var(--app-primary-50);

    & :deep(.text-primary-50) {
      color: var(--app-fuchsia-60);
    }
  }

  &.is-mark {
    @apply border-primary-50 border-1 border-l-3 py-3 px-4;
  }

  &.is-group {
    @apply border-primary-30 border-1 duration-300 cursor-pointer px-5 py-2 relative;

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

    &::before, &::after {
      content: '';
      @apply absolute w-4 h-4 bg-primary-50;
    }
    &::before {
      @apply -top-2 -left-2;
    }
    &::after {
      @apply -bottom-2 -right-2;
    }
  }
}
</style>
