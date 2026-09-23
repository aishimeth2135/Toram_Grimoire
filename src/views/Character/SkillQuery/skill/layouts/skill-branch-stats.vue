<template>
  <div>
    <div v-if="normalStats.length > 0" class="py-0.5">
      <div
        v-for="container in normalStats"
        :key="container.stat.statId"
        class="cy--text-underline text-primary-30 mb-1.5 mr-4 pb-0.5"
      >
        <SkillBranchPropValue :result="container" />
      </div>
    </div>
    <div v-if="captionStats.length > 0" class="flex flex-col gap-0.5">
      <SkillBranchPropValue
        v-for="container in captionStats"
        :key="container.stat.statId"
        :result="container"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { SkillBranchStatResult } from '@/lib/Skill/SkillComputing'

import SkillBranchPropValue from './skill-branch-prop-value.vue'

interface Props {
  statContainers: SkillBranchStatResult[]
}

const props = defineProps<Props>()

const normalStats = computed(() =>
  props.statContainers.filter(container => !container.displayCaption)
)
const captionStats = computed(() =>
  props.statContainers.filter(container => container.displayCaption)
)
</script>
