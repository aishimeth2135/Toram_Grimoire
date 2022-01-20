<template>
  <div>
    <SkillBranchLayoutNormal :container="container" :extra-columns="extraSuffixBranchDatas">
      <div
        v-if="container.has('caption')"
        class="py-0.5 pl-2 pr-1 inline-block"
        v-html="container.get('caption')"
      >
      </div>
      <SkillBranchStats
        v-else-if="container.statContainers.length !== 0"
        :stat-containers="container.statContainers"
      />
    </SkillBranchLayoutNormal>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'

import SkillBranchLayoutNormal from './layouts/skill-branch-layout-normal.vue'
import SkillBranchStats from './layouts/skill-branch-stats.vue'

import PassiveHandler from './branch-handlers/PassiveHandler'
import { setupCommonExtraSuffixBranches } from './setup'

interface Props {
  branchItem: SkillBranchItem;
}

const props = defineProps<Props>()
const { branchItem } = toRefs(props)

const container = computed(() => PassiveHandler(branchItem.value))

const { extraSuffixBranchDatas } = setupCommonExtraSuffixBranches(branchItem)
</script>
