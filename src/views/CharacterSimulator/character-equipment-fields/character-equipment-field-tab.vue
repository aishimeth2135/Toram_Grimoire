<script lang="ts" setup>
import { Ref, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { EquipmentField } from '@/lib/Character/Character'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import BrowseEquipmentsMain from '../browse-equipments/browse-equipments-main.vue'
import CharacterEquipmentDetails from '../character-equipment-details/character-equipment-details.vue'

interface Props {
  equipmentField: EquipmentField
}

interface Emits {
  (evt: 'submit', equipment: CharacterEquipment | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const current: Ref<CharacterEquipment | null> = ref(null)

const selectedEquipment = (equip: CharacterEquipment | null) => {
  if (equip && equip === current.value) {
    emit('submit', equip)
  } else {
    current.value = equip
  }
}

const currentValid = ref(false)

const stateChanged = ({
  selectedEquipmentValid,
}: {
  selectedEquipmentValid: boolean
}) => {
  currentValid.value = selectedEquipmentValid
}

watch(
  () => props.equipmentField,
  () => {
    current.value = null
  }
)
</script>

<template>
  <div class="flex flex-wrap py-4 wd-lg:flex-nowrap">
    <div class="flex flex-wrap items-start wd:flex-nowrap">
      <div class="px-2 pb-4 wd:px-0 wd-lg:pb-0">
        <CharacterEquipmentDetails
          :equipment="equipmentField.equipment"
          equipped
        />
      </div>
      <div class="px-2 pb-4 wd:px-8 wd-lg:pb-0">
        <CharacterEquipmentDetails
          :equipment="current"
          :equipped="current === equipmentField.equipment"
        />
      </div>
    </div>
    <div class="mt-8 flex w-full flex-col wd-lg:mt-0 wd-lg:pl-4">
      <BrowseEquipmentsMain
        :selected-equipment="current"
        :current-field="equipmentField"
        allow-equip
        class="min-h-0 flex-grow"
        @update:selected-equipment="selectedEquipment"
        @state-changed="stateChanged"
        @equip="emit('submit', $event)"
        @equip-cancel="emit('submit', null)"
      />
      <div class="px-4 py-3 text-right text-sm text-gray-40">
        {{
          t('character-simulator.browse-equipments.double-click-to-select-tips')
        }}
      </div>
    </div>
  </div>
</template>
