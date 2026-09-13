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
    <div class="flex w-full items-center border-b border-gray-20 py-1">
      <div class="flex shrink-0 items-center">
        <cy-icon :icon="crystal.crystalIconPath" />
        <span class="ml-1.5 text-sm text-cyan-60">{{ crystal.name }}</span>
      </div>
      <cy-button-icon
        icon="mdi:close-circle-outline"
        color="gray"
        class="ml-auto"
        @click="emit('remove', crystal)"
      />
    </div>
    <div class="mt-1.5 pr-2 pl-3">
      <CharacterEquipmentDetailsStat
        v-for="stat in crystal.stats"
        :key="stat.statId"
        :stat="stat"
      />
    </div>
  </div>
</template>
