<template>
  <div class="pt-2">
    <SkillEffectItemHistory
      v-for="historyItem in skillEffectItem.historys"
      :key="historyItem.date"
      :skill-effect-history-item="historyItem"
      :computing="rootComputingContainer"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'SkillEffectHistory',
}
</script>

<script lang="ts" setup>
import { inject } from 'vue'

import { SkillEffectItem } from '@/lib/Skill/SkillComputingContainer'

import SkillEffectItemHistory from './skill-effect-history-item.vue'

import { ComputingContainerInjectionKey } from '../injection-keys'


interface Props {
  skillEffectItem: SkillEffectItem;
}

defineProps<Props>()

const { rootComputingContainer } = inject(ComputingContainerInjectionKey)!
</script>
