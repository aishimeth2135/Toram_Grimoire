<template>
  <div class="flex flex-wrap">
    <div
      v-for="container in statContainers"
      :key="container.stat.statId"
      class="mr-3 text-primary-30"
    >
      <SkillBranchPropValue
        :result="container"
        :display-result="getResultDisplay(container)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isNumberString } from '@/shared/utils/string'

import { SkillBranchStatResult } from '@/lib/Skill/SkillComputingContainer/SkillBranchResult'

import SkillBranchPropValue from '@/views/SkillQuery/skill/layouts/skill-branch-prop-value.vue'

interface Props {
  statContainers: SkillBranchStatResult[]
}

defineProps<Props>()

const getResultDisplay = (ctner: SkillBranchStatResult) =>
  isNumberString(ctner.value) ? ctner.valueResult : ctner.result
</script>
