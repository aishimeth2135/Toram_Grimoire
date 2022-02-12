<template>
  <div class="px-3 py-2 border border-solid border-light m-2 bg-white" style="width: 23rem">
    <div class="flex items-center border-b border-solid border-light pb-1 mb-3">
      <cy-icon-text icon="gg-shape-square" size="small" text-color="purple">
        {{ t('common.Equipment.field.' + equipmentField.type) }}
      </cy-icon-text>
      <div class="ml-auto leading-none">
        <cy-button-icon
          v-if="!equipmentField.isEmpty"
          icon="ic-round-close"
          class="p-0"
          icon-color="red"
          @click="equipmentField.removeEquipment()"
        />
        <cy-button-icon
          icon="ic-round-view-list"
          class="p-0"
          icon-color="orange"
          @click="editEquipment"
        />
      </div>
    </div>
    <CharacterEquipmentInfo
      v-if="!equipmentField.isEmpty"
      :equipment="equipmentField.equipment!"
      :stats-disabled="equipmentField.statsDisabled()"
    />
    <cy-default-tips v-else icon="potum" icon-src="custom">
      {{ t('character-simulator.main-tips.no-equipment-selected') }}
    </cy-default-tips>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { inject } from 'vue'

import { EquipmentField } from '@/lib/Character/Character'

import CharacterEquipmentInfo from '../character-equipment/character-equipment-info.vue'

import { CharacterSimulatorInjectionKey } from '../injection-keys'

interface Props {
  equipmentField: EquipmentField;
}
const props = defineProps<Props>()

const { t } = useI18n()

const { editEquipmentFieldEquipment } = inject(CharacterSimulatorInjectionKey)!

const editEquipment = () => editEquipmentFieldEquipment(props.equipmentField)
</script>
