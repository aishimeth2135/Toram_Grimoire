<template>
  <div class="py-0.5">
    <div
      v-for="container in statContainers"
      :key="container.stat.statId"
      class="cy--text-underline mb-1.5 mr-4 pb-0.5 text-primary-30"
    >
      <div class="text-primary-90" v-html="container.result"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'

interface Props {
  statContainers: ResultContainerStat[]
}

defineProps<Props>()
</script>
