<template>
  <cy-modal
    :visible="visible"
    :title="t('character-simulator.equipment-basic-editor.equipment-stats')"
    footer
    @close="emit('close')"
  >
    <Draggable
      v-model="currentEquipment.stats"
      class="mt-2 space-y-1.5 pl-1"
      :item-key="getItemKey"
    >
      <template #item="{ element: stat }">
        <div class="flex items-center">
          <cy-icon-text icon="ic:baseline-drag-indicator" class="mr-2" />
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
      </template>
    </Draggable>
    <div class="mt-4">
      <cy-button-action icon="ic-round-add" @click="editStat(currentEquipment)">
        {{ t('character-simulator.equipment-basic-editor.edit-stats.title') }}
      </cy-button-action>
    </div>
  </cy-modal>
</template>

<script lang="ts" setup>
import Draggable from 'vuedraggable'
import { useI18n } from 'vue-i18n'
import { computed, inject } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { StatRestriction } from '@/lib/Character/Stat'

import { CharacterSimulatorInjectionKey } from '../injection-keys'

interface Props {
  visible: boolean;
  equipment: CharacterEquipment | null;
}
interface Emits {
  (evt: 'close'): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const ranges = {
  stability: [0, 100],
  stat: [null, null],
  boolStat: [1, 1],
}

const currentEquipment = computed(() => props.equipment!)

const { editStat } = inject(CharacterSimulatorInjectionKey)!

const getItemKey = (stat: StatRestriction) => stat.statId
</script>
