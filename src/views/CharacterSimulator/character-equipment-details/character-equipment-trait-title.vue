<script lang="ts" setup>
import { computed } from 'vue'

import type { CharacterEquipmentTrait } from '@/lib/Character/CharacterEquipment/CharacterEquipmentTrait'

interface Props {
  equipmentTrait: CharacterEquipmentTrait
}

const props = defineProps<Props>()

interface TitleData {
  color: string
  icon: string
}

const titleData = computed<TitleData>(() => {
  const icon =
    [
      'mdi:number-1-circle-outline',
      'mdi:number-2-circle-outline',
      'mdi:number-3-circle-outline',
      'mdi:number-4-circle-outline',
      'mdi:number-5-circle-outline',
      'mdi:number-6-circle-outline',
      'mdi:number-7-circle-outline',
      'mdi:number-8-circle-outline',
      'mdi:number-9-circle-outline',
    ].at(props.equipmentTrait.level - 1) ?? ''

  const colorMap = ['text-gray-60', 'text-emerald-60', 'text-blue-60', 'text-violet-60']
  const color =
    props.equipmentTrait.level > 4
      ? 'text-orange-60'
      : (colorMap.at(props.equipmentTrait.level - 1) ?? '')

  return {
    color,
    icon,
  }
})
</script>

<template>
  <div class="flex items-center text-sm" :class="titleData.color">
    <cy-icon :icon="titleData.icon" :class="titleData.color" class="mr-1" />
    {{ equipmentTrait.base.name }}
  </div>
</template>
