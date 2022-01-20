<template>
  <div class="pt-0.5">
    <div
      v-for="container in statContainers"
      :key="container.stat.statId"
      class="cy--text-underline text-light pb-0.5 mb-1.5 mx-2"
    >
      <div class="text-dark" v-html="container.result"></div>
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
