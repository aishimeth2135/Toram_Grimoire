<template>
  <div class="flex flex-wrap">
    <div
      v-for="container in statContainers"
      :key="container.stat.statId"
      class="text-light mr-3"
    >
      <span class="text-dark" v-html="getResultDisplay(container)"></span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isNumberString } from '@/shared/utils/string'

import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'

interface Props {
  statContainers: ResultContainerStat[];
}

defineProps<Props>()

const getResultDisplay = (ctner: ResultContainerStat) => isNumberString(ctner.value) ? ctner.valueResult : ctner.result
</script>
