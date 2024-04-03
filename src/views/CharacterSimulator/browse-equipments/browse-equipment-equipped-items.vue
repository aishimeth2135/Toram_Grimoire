<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { useCharacterStore } from '@/stores/views/character'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import BrowseEquipmentsListItem from './browse-equipments-list-item.vue'

const selectedEquipment = defineModel<CharacterEquipment | null>(
  'selectedEquipment',
  {
    required: true,
  }
)

const { currentCharacter } = storeToRefs(useCharacterStore())

const fieldEquipments = computed(() => {
  return currentCharacter.value.equipmentFields
    .map(field => field.equipment)
    .filter(equip => equip) as CharacterEquipment[]
})
</script>

<template>
  <div>
    <BrowseEquipmentsListItem
      v-for="equip in fieldEquipments"
      :key="equip.instanceId"
      :equipment="equip"
      :selected="selectedEquipment === equip"
      equipped
      @click="selectedEquipment = equip"
    />
  </div>
</template>
