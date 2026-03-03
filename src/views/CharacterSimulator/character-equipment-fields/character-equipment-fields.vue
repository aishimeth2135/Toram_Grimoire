<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { type Ref, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import { useDevice } from '@/shared/setup/Device'

import { EquipmentField, EquipmentFieldTypes } from '@/lib/Character/Character'
import { CharacterEquipment, EquipmentTypes } from '@/lib/Character/CharacterEquipment'

import BrowseEquipmentsMain from '../browse-equipments/browse-equipments-main.vue'
import CharacterEquipmentDetails from '../character-equipment-details/character-equipment-details.vue'
import CharacterEquipmentsManage from '../character-equipments-manage/character-equipments-manage.vue'
import CommonEquipmentIcon from '../common/common-equipment-icon.vue'

const { t } = useI18n()
const { device } = useDevice()

const { currentCharacter } = storeToRefs(useCharacterStore())

const currentField = ref(currentCharacter.value.equipmentFields[0]) as Ref<EquipmentField>

const equipmentsManageVisible = ref(false)

watch(currentCharacter, newValue => {
  currentField.value = newValue.equipmentFields[0]
})

const selectedEquipment: Ref<CharacterEquipment | null> = ref(null)

watch(currentField, () => {
  selectedEquipment.value = null
})

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

const getFieldDefaultIcon = (field: EquipmentField): string => {
  if (field.type === EquipmentFieldTypes.BodyArmor) {
    return CharacterEquipment.getImagePath(EquipmentTypes.BodyNormal)
  }
  if (field.type === EquipmentFieldTypes.Additional) {
    return CharacterEquipment.getImagePath(EquipmentTypes.Additional)
  }
  if (field.type === EquipmentFieldTypes.Special) {
    return CharacterEquipment.getImagePath(EquipmentTypes.Special)
  }

  return 'mdi:circle-outline'
}
</script>

<template>
  <div class="flex grow flex-col items-center justify-center">
    <div class="wd-lg:flex-nowrap flex w-full flex-wrap px-2">
      <div class="wd:flex-nowrap flex flex-wrap items-start">
        <cy-tabs
          v-model="currentField"
          :direction="device.isWide ? 'vertical' : 'horizontal'"
          :class="
            device.isWide
              ? 'bg-primary-5/50 mr-6 rounded-full py-4'
              : 'border-primary-10 mb-4 border-b'
          "
          plain
        >
          <cy-tab
            v-for="field in currentCharacter.equipmentFields"
            :key="field.fieldId"
            :value="field"
            class="hover:bg-primary-10 px-5 py-3"
          >
            <CommonEquipmentIcon
              v-if="field.equipment"
              :equipment="field.equipment"
              width="1.5rem"
            />
            <cy-icon v-else width="1.5rem" :icon="getFieldDefaultIcon(field)" class="opacity-50" />
          </cy-tab>
        </cy-tabs>
        <div class="wd:px-0 wd-lg:pb-0 px-2 py-4">
          <CharacterEquipmentDetails :equipment="currentField.equipment" equipped />
        </div>
        <div v-if="!device.isMobile" class="wd:px-8 wd-lg:pb-0 px-2 py-4">
          <CharacterEquipmentDetails
            :equipment="selectedEquipment"
            :equipped="selectedEquipment === currentField.equipment"
          />
        </div>
      </div>
      <div
        :class="device.isMobile ? 'border-primary-10 mt-5 border-t' : 'pl-4'"
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
        >
          <template #additional-actions>
            <cy-button-circle
              icon="ic:baseline-more-horiz"
              color="gray"
              small
              @click="equipmentsManageVisible = true"
            />
          </template>
        </BrowseEquipmentsMain>
        <div class="text-gray-40 px-4 py-3 text-right text-sm">
          {{ t('character-simulator.browse-equipments.double-click-to-select-tips') }}
        </div>
        <CharacterEquipmentsManage v-model:visible="equipmentsManageVisible" />
      </div>
    </div>
  </div>
</template>
