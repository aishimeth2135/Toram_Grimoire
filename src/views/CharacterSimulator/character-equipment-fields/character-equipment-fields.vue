<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { type Ref, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import { useDevice } from '@/shared/setup/Device'

import { EquipmentField } from '@/lib/Character/Character'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import BrowseEquipmentsMain from '../browse-equipments/browse-equipments-main.vue'
import CharacterEquipmentDetails from '../character-equipment-details/character-equipment-details.vue'
import CommonEquipmentIcon from '../common/common-equipment-icon.vue'

const { t } = useI18n()
const { device } = useDevice()

const { currentCharacter } = storeToRefs(useCharacterStore())

const currentField = ref(currentCharacter.value.equipmentFields[0]) as Ref<EquipmentField>

watch(currentCharacter, newValue => {
  currentField.value = newValue.equipmentFields[0]
})

const selectedEquipment: Ref<CharacterEquipment | null> = ref(null)

const applySelectedEquipment = (equip: CharacterEquipment | null) => {
  currentField.value.setEquipment(equip)
}

const selectEquipment = (equip: CharacterEquipment | null) => {
  if (equip && equip === selectedEquipment.value) {
    applySelectedEquipment(equip)
  } else {
    selectedEquipment.value = equip
  }
}
</script>

<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex grow flex-col items-center justify-center">
    <div class="flex flex-wrap px-2 wd-lg:flex-nowrap">
      <div class="flex flex-wrap items-start wd:flex-nowrap">
        <cy-tabs
          v-model="currentField"
          :direction="device.isWide ? 'vertical' : 'horizontal'"
          :class="
            device.isWide
              ? 'bg-primary-5/50 mr-6 rounded-full py-4'
              : 'mb-4 border-b border-primary-10'
          "
          plain
        >
          <cy-tab
            v-for="field in currentCharacter.equipmentFields"
            :key="field.fieldId"
            :value="field"
            class="px-5 py-3 hover:bg-primary-10"
          >
            <CommonEquipmentIcon
              v-if="field.equipment"
              :equipment="field.equipment"
              width="1.5rem"
            />
            <cy-icon v-else width="1.5rem" icon="mdi:circle-outline" />
          </cy-tab>
        </cy-tabs>
        <div class="px-2 py-4 wd:px-0 wd-lg:pb-0">
          <CharacterEquipmentDetails :equipment="currentField.equipment" equipped />
        </div>
        <div v-if="!device.isMobile" class="px-2 py-4 wd:px-8 wd-lg:pb-0">
          <CharacterEquipmentDetails
            :equipment="selectedEquipment"
            :equipped="selectedEquipment === currentField.equipment"
          />
        </div>
      </div>
      <!-- <CharacterEquipmentFieldTab
      :equipment-field="currentField"
      @submit="currentField.setEquipment($event)"
    /> -->
      <div
        :class="device.isMobile ? 'mt-5 border-t border-primary-10' : 'pl-4'"
        class="flex h-[45rem] min-w-[20rem] grow flex-col pt-4"
      >
        <BrowseEquipmentsMain
          :selected-equipment="selectedEquipment"
          :current-field="currentField"
          allow-equip
          class="min-h-0 grow"
          @update:selected-equipment="selectEquipment"
          @equip="applySelectedEquipment"
          @equip-cancel="applySelectedEquipment(null)"
        />
        <div class="px-4 py-3 text-right text-sm text-gray-40">
          {{ t('character-simulator.browse-equipments.double-click-to-select-tips') }}
        </div>
      </div>
    </div>
  </div>
</template>
