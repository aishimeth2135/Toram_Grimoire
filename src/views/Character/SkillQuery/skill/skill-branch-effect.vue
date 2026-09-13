<template>
  <div>
    <SkillBranchLayoutNormal
      :computing="computing"
      :container="container"
      :name-props="nameProps"
      :sub-contents="subContents"
      :has-area="hasArea"
      :extra-columns="extraSuffixBranchDatas"
      :main-title="container.get('condition')"
      main-icon="icon-park-outline:effects"
    >
      <div class="mb-1">
        <SkillBranchPropValue
          v-if="container.has('caption')"
          class="inline-block py-0.5 pr-1"
          :result="container.result('caption')"
        />
        <SkillBranchStats
          v-else-if="container.statContainers.length !== 0"
          :stat-containers="container.statContainers"
        />
      </div>
    </SkillBranchLayoutNormal>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'

import SkillBranchLayoutNormal from './layouts/skill-branch-layout-normal.vue'
import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'
import SkillBranchStats from './layouts/skill-branch-stats.vue'

import EffectHandler from './branch-handlers/EffectHandler'
import { type NormalLayoutSubContent } from './layouts/setup'
import { setupCommonExtraSuffixBranches } from './setup'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => EffectHandler(props.computing, branchItem.value))

const nameProps = computed(() => {
  const res = []
  if (container.value.get('type')) {
    res.push(container.value.get('type'))
  }
  return res
})

const subContents = computed(() => {
  return [
    {
      key: 'duration',
      icon: 'zmdi-time-interval',
    },
    {
      key: 'end_condition',
      icon: 'zmdi-time-interval',
      type: 'primary',
    },
    {
      key: 'is_place',
      icon: 'emojione-monotone:heavy-large-circle',
    },
  ] as NormalLayoutSubContent[]
})

const { extraSuffixBranchDatas } = setupCommonExtraSuffixBranches(props.computing, branchItem)

const hasArea = computed(() => {
  return (
    container.value.getOrigin('type') === 'aura' || container.value.getOrigin('type') === 'circle'
  )
})
</script>
