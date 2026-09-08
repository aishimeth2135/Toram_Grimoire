<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { StatRestriction } from '@/lib/Character/Stat'

import CommonEditModeButton from '../common/common-edit-mode-button.vue'
import CommonPropNumberInput from '../common/common-prop-number-input.vue'
import CharacterEquipmentDetailsSelectStat from './character-equipment-details-select-stat.vue'
import EquipmentPropInputContainer from './equipment-prop-input-container.vue'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const { t } = useI18n()

const isEditing = ref(props.equipment.stats.length === 0)

watch(
  () => props.equipment,
  () => {
    isEditing.value = props.equipment.stats.length === 0
  }
)

const getStatKey = (stat: StatRestriction) => stat.statId

// const SelectStatTab = {
//   Common: 0,
//   Clone: 1,
// } as const
// type SelectStatTab = (typeof SelectStatTab)[keyof typeof SelectStatTab]

// const currentSelectStatTab = ref<SelectStatTab>(SelectStatTab.Common)

// const cloneStats = (stats: StatRestriction[]) => {
//   stats = stats.filter(
//     stat => !props.equipment.stats.some(_stat => _stat.equals(stat))
//   )
//   // eslint-disable-next-line vue/no-mutating-props
//   props.equipment.stats.push(...stats)
//   currentSelectStatTab.value = SelectStatTab.Common
// }
</script>

<template>
  <div class="flex h-full w-full flex-col py-2">
    <div class="mb-3 flex justify-end">
      <CommonEditModeButton v-model:is-editing="isEditing" />
    </div>
    <div v-if="!isEditing">
      <Draggable
        v-if="equipment.stats.length > 0"
        v-model="
          // eslint-disable-next-line vue/no-mutating-props
          equipment.stats
        "
        class="space-y-6 px-1"
        :item-key="getStatKey"
        handle=".drag-handle"
      >
        <template #item="{ element: stat }">
          <EquipmentPropInputContainer>
            <CommonPropNumberInput v-model:value="stat.value" :title="stat.title" />
            <template #append>
              <cy-button-icon
                icon="mdi:close-circle-outline"
                small
                color="gray"
                class="ml-4"
                @click="equipment.removeStat(stat)"
              />
            </template>
            <template #end>
              <cy-icon
                icon="ic:baseline-drag-indicator"
                class="drag-handle shrink-0 cursor-pointer"
              />
            </template>
          </EquipmentPropInputContainer>
        </template>
      </Draggable>
      <div v-else class="text-primary-60 py-2 text-sm">
        {{ t('character-simulator.select-stats.stat-empty-tips') }}
      </div>
    </div>
    <CharacterEquipmentDetailsSelectStat v-else :equipment="equipment" />
  </div>
</template>
