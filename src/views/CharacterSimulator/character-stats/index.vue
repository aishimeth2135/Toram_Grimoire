<template>
  <SideFloat :visible="visible" @update:visible="emit('close')">
    <div class="overflow-x-auto">
      <div class="min-w-[20rem] px-4 py-2 wd:w-[32rem] wd:px-6">
        <div v-for="data in categoryResults" :key="data.name" class="mb-4 px-2">
          <div class="py-1 text-sm text-primary-30">
            {{ data.name }}
          </div>
          <CharacterStatItem
            v-for="stat in data.stats"
            :key="data.name + stat.id"
            :character-stat-result="stat"
            :preview-visible="
              characterSimulatorOptions.characterStatsDetailPreviewVisible
            "
          />
        </div>
      </div>
    </div>
    <div class="flex items-center px-4 pb-4 text-sm text-gray-40">
      <cy-icon icon="ic:outline-info" class="mr-2 text-gray-40" />
      {{
        t(
          'character-simulator.character-stat-detail.toggle-detail-visibility-caption'
        )
      }}
    </div>
    <div class="border-t border-primary-10 px-2.5 pb-5 pt-3">
      <cy-button-toggle
        v-model:selected="
          characterSimulatorOptions.characterStatsDetailPreviewVisible
        "
      >
        {{ t('character-simulator.character-stat-detail.show-detail-preview') }}
      </cy-button-toggle>
    </div>
  </SideFloat>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'

import SideFloat from '@/components/app-layout/side-float/side-float.vue'

import CharacterStatItem from './character-stat-item.vue'

import { CharacterSimulatorInjectionKey } from '../injection-keys'
import { setupCharacterStore } from '../setup'

interface Props {
  visible: boolean
}
interface Emits {
  (evt: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

defineOptions({
  name: 'CharacterStats',
})

const { t } = useI18n()

const { characterStatCategoryResults } = setupCharacterStore()

const categoryResults = computed(() => {
  return characterStatCategoryResults.value
    .map(result => ({
      name: result.name,
      stats: result.stats.filter(stat => !stat.hidden),
    }))
    .filter(item => item.stats.length > 0)
})

const { characterSimulatorOptions } = inject(CharacterSimulatorInjectionKey)!
</script>
