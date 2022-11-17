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

import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'

import SkillBranchPropValue from '@/views/SkillQuery/skill/layouts/skill-branch-prop-value.vue'

interface Props {
  statContainers: ResultContainerStat[]
}

defineProps<Props>()

const getResultDisplay = (ctner: ResultContainerStat) =>
  isNumberString(ctner.value) ? ctner.valueResult : ctner.result
</script>
