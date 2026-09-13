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
import { computed } from 'vue'

import { SkillBranchNames } from '@/lib/Skill/Skill'
import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'

import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'

import TextHandler from './branch-handlers/TextHandler'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const props = defineProps<Props>()

const container = computed(() => TextHandler(props.computing, props.branchItem))

if (props.branchItem.isGroup) {
  props.branchItem.initGroupExpaneded()
}

const rootClicked = () => {
  if (props.branchItem.isGroup) {
    props.branchItem.toggleGroupExpanded()
  }
}

const rootClassList = computed(() => {
  return {
    'is-tips': props.branchItem.is(SkillBranchNames.Tips),
    'is-mark': props.branchItem.propBoolean('is_mark'),
    'is-group': props.branchItem.isGroup,
    'group-active': props.branchItem.groupState.expanded,
  }
})
</script>

<style scoped>
@reference "@/tailwind.css";

.text-content {
  display: flex;
  align-items: flex-start;
  padding-inline: --spacing(3);
  padding-block: --spacing(1);
  width: 100%;

  &.is-tips {
    padding-left: --spacing(5);

    /* APPLY text-primary-50 */
    color: var(--app-primary-50);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);

    & :deep(.text-primary-50) {
      color: var(--app-fuchsia-60);
    }
  }

  &.is-mark {
    border-width: 2px;
    border-left-width: 6px;
    border-color: var(--color-primary-50);
    padding-inline: --spacing(4);
    padding-block: --spacing(3);
  }

  &.is-group {
    position: relative;
    transition-duration: 300ms;
    cursor: pointer;
    margin-block: --spacing(2);
    border-width: 2px;
    border-color: var(--color-primary-30);
    padding-inline: --spacing(5);
    padding-block: --spacing(2);
    color: var(--color-primary-80);

    &.group-active {
      border-color: var(--color-primary-50);
      border-right-color: transparent;
      border-bottom-color: transparent;
      border-left-color: transparent;

      &::after {
        display: none;
      }
    }

    &:hover {
      border-color: var(--color-primary-60);

      &::before {
        background-color: var(--color-primary-60);
      }
    }

    &::before,
    &::after {
      position: absolute;
      background-color: var(--color-primary-50);
      width: --spacing(4);
      height: --spacing(4);
      content: '';
    }
    &::before {
      top: --spacing(-2);
      left: --spacing(-2);
    }
    &::after {
      right: --spacing(-2);
      bottom: --spacing(-2);
    }
  }
}
</style>
