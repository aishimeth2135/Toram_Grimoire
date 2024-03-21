<template>
  <cy-popover
    v-if="currentBranchItem && rootComputingContainer"
    tag="span"
    class="inline-block px-0.5"
    triggers="click hover"
    popper-class="!border-0"
  >
    <span class="cursor-pointer text-cyan-60 underline">
      {{ currentBranchItem.prop('name') }}
    </span>
    <template #popper>
      <SkillBranch
        :computing="rootComputingContainer"
        :skill-branch-item="currentBranchItem"
        class="w-full"
        sub
        :content-auto="false"
      />
    </template>
  </cy-popover>
  <span v-else class="text-red-60">
    {{ branchName }}
  </span>
</template>

<script lang="ts" setup>
import { InjectionKey, computed, inject } from 'vue'

import SkillBranch from '../skill-branch.vue'

import {
  ComputingContainerInjection,
  ComputingContainerInjectionKey,
  SkillEffectInjection,
  SkillEffectInjectionKey,
} from '../../injection-keys'

interface Props {
  branchName: string
}

const props = defineProps<Props>()

const { rootComputingContainer } = inject(
  ComputingContainerInjectionKey as InjectionKey<
    Partial<ComputingContainerInjection>
  >,
  {}
)

const { currentEffectItem } = inject(
  SkillEffectInjectionKey as InjectionKey<Partial<SkillEffectInjection>>,
  {}
)

const currentBranchItem = computed(() => {
  if (!currentEffectItem) {
    return null
  }
  const branchItem = currentEffectItem.value!.branchItems.find(
    bch => bch.prop('name') === props.branchName
  )
  return branchItem ?? null
})
</script>
