<template>
  <div class="flex flex-wrap space-x-3">
    <div
      v-for="container in statContainers"
      :key="container.stat.statId"
      class="text-light"
    >
      <span class="text-dark" v-html="container.result"></span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ResultContainerStat } from '@/lib/Skill/SkillComputingContainer/ResultContainer'

interface Props {
  statContainers: ResultContainerStat[];
}

defineProps<Props>()
</script>
