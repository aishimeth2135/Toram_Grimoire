<script lang="ts" setup>
import { ref } from 'vue'
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

defineProps<Props>()

const isEditing = ref(false)

const getStatKey = (stat: StatRestriction) => stat.statId

// const enum SelectStatTab {
//   Common,
//   Clone,
// }

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
    </div>
    <CharacterEquipmentDetailsSelectStat v-else :equipment="equipment" />
  </div>
</template>
