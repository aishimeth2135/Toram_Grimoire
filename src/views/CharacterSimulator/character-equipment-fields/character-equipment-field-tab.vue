<script lang="ts" setup>
import { Ref, ref, watch } from 'vue'

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
      <div class="px-2 wd:px-0">
        <CharacterEquipmentDetails
          :equipment="equipmentField.equipment"
          equipped
        />
      </div>
      <div class="px-2 py-4 wd:px-8 wd-lg:py-0">
        <CharacterEquipmentDetails
          :equipment="current"
          :equipped="current === equipmentField.equipment"
        />
      </div>
    </div>
    <div class="mt-4 w-full wd-lg:mt-0 wd-lg:pl-4">
      <BrowseEquipmentsMain
        :selected-equipment="current"
        :current-field="equipmentField"
        allow-equip
        @update:selected-equipment="selectedEquipment"
        @state-changed="stateChanged"
        @equip="emit('submit', $event)"
        @equip-cancel="emit('submit', null)"
      />
    </div>
  </div>
</template>
