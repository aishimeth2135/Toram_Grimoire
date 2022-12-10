<template>
  <div
    class="m-1.5 rounded border-1 border-red-20 bg-white"
    style="width: 23.25rem"
  >
    <div
      class="mb-1.5 flex items-center border-b border-solid border-red-20 py-1 pl-3 pr-1.5"
    >
      <cy-icon-text icon="gg-shape-square" small color="red-30" single-color>
        {{ t('common.Equipment.field.' + equipmentField.type) }}
      </cy-icon-text>
      <div class="ml-auto flex leading-none">
        <cy-button-icon
          v-if="!equipmentField.isEmpty"
          icon="ic-round-close"
          class="p-0"
          icon-color="orange-60"
          @click="equipmentField.removeEquipment()"
        />
        <cy-button-icon
          icon="mdi:checkbox-blank-badge-outline"
          class="p-0"
          icon-color="orange-60"
          @click="editEquipment"
        />
      </div>
    </div>
    <div class="px-3 pb-2">
      <CharacterEquipmentDetail
        v-if="!equipmentField.isEmpty"
        :equipment="equipmentField.equipment!"
        :stats-disabled="equipmentField.statsDisabled()"
        :is-sub="equipmentField.type === EquipmentFieldTypes.SubWeapon"
        :main-weapon="
          equipmentField.belongCharacter.fieldEquipment(
            EquipmentFieldTypes.MainWeapon
          )
        "
      />
      <cy-default-tips v-else icon="mdi:dots-horizontal-circle-outline">
        {{ t('character-simulator.main-tips.no-equipment-selected') }}
      </cy-default-tips>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

import { EquipmentField } from '@/lib/Character/Character'
import { EquipmentFieldTypes } from '@/lib/Character/Character/enums'

import CharacterEquipmentDetail from '../character-equipment/character-equipment-detail.vue'

import { CharacterSimulatorInjectionKey } from '../injection-keys'

interface Props {
  equipmentField: EquipmentField
}
const props = defineProps<Props>()

const { t } = useI18n()

const { editEquipmentFieldEquipment } = inject(CharacterSimulatorInjectionKey)!

const editEquipment = () => editEquipmentFieldEquipment(props.equipmentField)
</script>
