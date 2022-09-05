<template>
  <div class="space-y-1">
    <div
      v-for="{ container, iid } in containerStates"
      :key="iid"
      class="list-text-content"
      :class="{ 'tips': isTips }"
    >
      <cy-icon-text
        icon="jam:leaf"
        class="mr-2"
        icon-width="1rem"
      />
      <div v-html="container.get('text')"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import SkillComputingContainer, { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import ListHandler from './branch-handlers/ListHandler'

interface Props {
  computing: SkillComputingContainer;
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const containers = computed(() => ListHandler(props.computing, branchItem.value))

const containerStates = computed(() => containers.value.map((container, iid) => ({ iid, container })))

const isTips = computed(() => {
  return branchItem.value.propBoolean('is_tips')
})
</script>

<style lang="postcss" scoped>
.list-text-content {
  @apply px-3 py-0.5 w-full flex items-start;

  &.tips {
    @apply text-sm pl-5;

    /* APPLY text-primary-50 */
    color: var(--app-primary-50);

    & :deep(.text-primary-50) {
      color: var(--app-fuchsia-60);
    }
  }

  &.is-mark {
    @apply border-primary-50 border-1 py-3;
  }
}
</style>
