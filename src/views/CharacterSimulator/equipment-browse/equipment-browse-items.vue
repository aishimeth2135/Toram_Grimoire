<script lang="ts" setup>
import { computed } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import EquipmentBrowseItem from './equipment-browse-item.vue'

import { setupCharacterStore } from '../setup'

interface Props {
  current: CharacterEquipment | null
  filter?: (equip: CharacterEquipment) => boolean
}
interface Emits {
  (evt: 'update:current', value: CharacterEquipment | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { equipments } = setupCharacterStore()

const currentEquipments = computed(() => {
  if (!props.filter) {
    return equipments.value
  }
  return equipments.value.filter(props.filter)
})
</script>

<template>
  <div>
    <EquipmentBrowseItem
      v-for="equip in currentEquipments"
      :key="equip.id"
      :equipment="equip"
      class="m-1.5"
      @click="emit('update:current', equip)"
    />
  </div>
</template>
