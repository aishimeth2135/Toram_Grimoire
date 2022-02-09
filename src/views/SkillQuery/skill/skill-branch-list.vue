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

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import ListHandler from './branch-handlers/ListHandler'

interface Props {
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const containers = computed(() => ListHandler(branchItem.value))

const containerStates = computed(() => containers.value.map((container, iid) => ({ iid, container })))

const isTips = computed(() => {
  return branchItem.value.attrBoolean('is_tips')
})
</script>

<style lang="postcss" scoped>
.list-text-content {
  @apply px-3 py-0.5 w-full flex items-start;

  &.tips {
    @apply text-sm pl-5;

    /* APPLY text-light-3 */
    color: var(--primary-light-3);

    & :deep(.text-light-3) {
      color: var(--primary-purple);
    }
  }

  &.is-mark {
    @apply border-light-3 border-1 py-3;
  }
}
</style>
