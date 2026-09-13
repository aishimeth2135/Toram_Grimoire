<template>
  <div v-if="skillEffectItem.historys.length > 0" class="space-y-2 pt-2">
    <SkillEffectItemHistory
      v-for="historyItem in skillEffectItem.historys"
      :key="historyItem.date"
      :skill-effect-history-item="historyItem"
      :computing="rootComputingContainer"
    />
  </div>
  <div v-else class="text-primary-30 h-48 px-1 py-3 text-sm">
    {{ t('skill-query.historical-record-equipment-type-invalid-tips') }}
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillEffectItem } from '@/lib/Skill/SkillComputing'

import SkillEffectItemHistory from './skill-effect-history-item.vue'

import { ComputingContainerInjectionKey } from '../injection-keys'

defineOptions({
  name: 'SkillEffectHistory',
})

interface Props {
  skillEffectItem: SkillEffectItem
}

defineProps<Props>()

const { t } = useI18n()

const { rootComputingContainer } = inject(ComputingContainerInjectionKey)!
</script>
