<template>
  <div class="flex items-center">
    <cy-icon
      :icon="
        !equipment.is(EquipmentKinds.Avatar)
          ? equipment.getCategoryImagePath()
          : equipment.categoryIcon
      "
    />
    <div class="ml-2 inline-block text-ellipsis" style="max-width: 12rem">
      {{ equipment.name }}
    </div>
    <span
      v-if="equipment.hasRefining && equipment.refining !== 0"
      class="ml-1 text-blue-60"
    >
      +{{ equipment.refining }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentKinds } from '@/lib/Character/CharacterEquipment'

interface Props {
  equipment: CharacterEquipment
  selected?: boolean
  small?: boolean
  textColor?: string
}

withDefaults(defineProps<Props>(), {
  selected: false,
  textColor: 'default',
})
</script>
