<template>
  <div>
    <SkillBranchLayoutNormal
      :computing="computing"
      :container="container"
      :extra-columns="extraSuffixBranchDatas"
      main-icon="icon-park-outline:effects"
    >
      <SkillBranchPropValue
        v-if="container.has('caption')"
        class="inline-block py-0.5 pl-2 pr-1"
        :result="container.result('caption')"
      />
      <SkillBranchStats
        v-else-if="container.statContainers.length !== 0"
        :stat-containers="container.statContainers"
      />
    </SkillBranchLayoutNormal>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import { SkillBranchItem, SkillComputingContainer } from '@/lib/Skill/SkillComputing'

import SkillBranchLayoutNormal from './layouts/skill-branch-layout-normal.vue'
import SkillBranchPropValue from './layouts/skill-branch-prop-value.vue'
import SkillBranchStats from './layouts/skill-branch-stats.vue'

import PassiveHandler from './branch-handlers/PassiveHandler'
import { setupCommonExtraSuffixBranches } from './setup'

interface Props {
  computing: SkillComputingContainer
  branchItem: SkillBranchItem
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => PassiveHandler(props.computing, branchItem.value))

const { extraSuffixBranchDatas } = setupCommonExtraSuffixBranches(props.computing, branchItem)
</script>
