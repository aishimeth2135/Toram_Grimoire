<template>
  <div v-if="equipment">
    <cy-icon-text
      icon="mdi-clipboard-edit-outline"
      size="small"
      text-color="purple"
    >
      {{ t('character-simulator.equipment-basic-editor.equipment-name') }}
    </cy-icon-text>
    <div class="mt-2">
      <cy-title-input
        v-model:value="currentEquipment.name"
        icon="mdi-clipboard-edit-outline"
      />
    </div>
    <div class="mt-3">
      <cy-icon-text
        icon="mdi-rhombus-outline"
        size="small"
        text-color="purple"
      >
        {{ t('character-simulator.equipment-basic-editor.equipment-stats') }}
      </cy-icon-text>
    </div>
    <div class="mt-2 space-y-1">
      <div
        v-for="stat in currentEquipment.stats"
        :key="stat.statId"
      >
        <cy-input-counter
          v-model:value="stat.value"
          type="line"
          class="set-stat-value"
          input-width="2.6rem"
          :range="stat.isBoolStat ? ranges.boolStat : ranges.stat"
        >
          <template #title>
            <cy-icon-text icon="mdi-rhombus-outline">
              {{ stat.show() }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
      </div>
    </div>
    <div class="mt-3">
      <cy-button-border icon="ic-round-add" @click="editStat(currentEquipment)">
        {{ t('character-simulator.equipment-basic-editor.edit-stats.title') }}
      </cy-button-border>
    </div>
    <div v-if="hasOther" class="mt-3">
      <cy-icon-text
        icon="mdi-rhombus-outline"
        size="small"
        text-color="purple"
      >
        {{ t('character-simulator.equipment-basic-editor.equipment-other') }}
      </cy-icon-text>
      <div class="mt-2 content">
        <cy-input-counter
          v-if="currentEquipment.hasStability"
          v-model:value="currentEquipment.stability"
        >
          <template #title>
            <cy-icon-text icon="mdi-rhombus-outline">
              {{ t('character-simulator.equipment-info.stability') }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, inject } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import { CharacterSimulatorInjectionKey } from '../injection-keys'

interface Props {
  equipment: CharacterEquipment | null;
}

const props = defineProps<Props>()

const { t } = useI18n()

const ranges = {
  stability: [0, 100],
  stat: [null, null],
  boolStat: [1, 1],
}

const currentEquipment = computed(() => props.equipment!)

const hasOther = computed(() => currentEquipment.value.hasStability)

const { editStat } = inject(CharacterSimulatorInjectionKey)!
</script>
