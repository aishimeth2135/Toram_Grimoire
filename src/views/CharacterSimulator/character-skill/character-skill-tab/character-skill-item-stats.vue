<template>
  <div>
    <div v-if="normalStats.length" class="flex flex-wrap gap-x-3">
      <div v-for="container in normalStats" :key="container.stat.statId" class="text-primary-30">
        <SkillBranchPropValue :result="container" :display-result="getResultDisplay(container)" />
      </div>
    </div>
    <div v-if="captionStats.length" class="text-primary-70">
      <div v-for="container in captionStats" :key="container.stat.statId">
        <SkillBranchPropValue :result="container" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { isNumberString } from '@/shared/utils/string'

import { SkillBranchStatResult } from '@/lib/Skill/SkillComputing'

import SkillBranchPropValue from '@/views/Character/SkillQuery/skill/layouts/skill-branch-prop-value.vue'

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

const getResultDisplay = (ctner: SkillBranchStatResult) =>
  isNumberString(ctner.value) ? ctner.valueResult : ctner.result
</script>
