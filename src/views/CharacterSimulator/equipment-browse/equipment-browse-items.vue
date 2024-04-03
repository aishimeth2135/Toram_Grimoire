<script lang="ts" setup>
import { computed } from 'vue'

import { useCharacterStore } from '@/stores/views/character'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import EquipmentBrowseItem from './equipment-browse-item.vue'

interface Props {
  current: CharacterEquipment | null
  filter?: (equip: CharacterEquipment) => boolean
}
interface Emits {
  (evt: 'update:current', value: CharacterEquipment | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const characterStore = useCharacterStore()

const currentEquipments = computed(() => {
  if (!props.filter) {
    return characterStore.equipments
  }
  return characterStore.equipments.filter(props.filter)
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
