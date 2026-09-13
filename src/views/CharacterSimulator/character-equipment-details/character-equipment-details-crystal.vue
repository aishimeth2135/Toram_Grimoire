<script lang="ts" setup>
import { EquipmentCrystal } from '@/lib/Character/CharacterEquipment'

import CharacterEquipmentDetailsStat from './character-equipment-details-stat.vue'

interface Props {
  crystal: EquipmentCrystal
}
interface Emits {
  (evt: 'remove', crystal: EquipmentCrystal): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div>
    <div class="border-gray-20 flex w-full items-center border-b py-1">
      <div class="flex shrink-0 items-center">
        <cy-icon :icon="crystal.crystalIconPath" />
        <span class="text-cyan-60 ml-1.5 text-sm">{{ crystal.name }}</span>
      </div>
      <cy-button-icon
        icon="mdi:close-circle-outline"
        color="gray"
        class="ml-auto"
        @click="emit('remove', crystal)"
      />
    </div>
    <div class="mt-1.5 pl-3 pr-2">
      <CharacterEquipmentDetailsStat
        v-for="stat in crystal.stats"
        :key="stat.statId"
        :stat="stat"
      />
    </div>
  </div>
</template>
