<script lang="ts" setup>
import { EquipmentCrystal } from '@/lib/Character/CharacterEquipment'

import CharacterEquipmentDetailsStat from './character-equipment-details-stat.vue'

interface Props {
  crystal: EquipmentCrystal
}

defineProps<Props>()
</script>

<template>
  <div>
    <div class="flex w-full items-center">
      <div class="flex flex-shrink-0 items-center">
        <cy-icon :path="crystal.crystalIconPath" />
        <span class="ml-1 text-sm text-cyan-60">{{ crystal.name }}</span>
      </div>
      <div class="ml-2 w-full border-b border-stone-30"></div>
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
