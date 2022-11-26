<template>
  <div class="py-0.5">
    <div
      v-for="container in statContainers"
      :key="container.stat.statId"
      class="cy--text-underline mb-1.5 mr-4 pb-0.5 text-primary-30"
    >
      <SkillBranchPropValue :result="container" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SkillBranchStatResult } from '@/lib/Skill/SkillComputingContainer/SkillBranchResult'

import SkillBranchPropValue from './skill-branch-prop-value.vue'

interface Props {
  statContainers: SkillBranchStatResult[]
}

defineProps<Props>()
</script>
