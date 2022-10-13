<template>
  <cy-icon-text
    :icon="
      !equipment.is(EquipmentKinds.Avatar)
        ? equipment.getCategoryImagePath()
        : equipment.categoryIcon
    "
    :icon-src="!equipment.is(EquipmentKinds.Avatar) ? 'image' : 'iconify'"
    :small="small"
    :text-color="textColor"
  >
    <div class="inline-block text-ellipsis" style="max-width: 12rem">
      {{ equipment.name }}
    </div>
    <span
      v-if="equipment.hasRefining && equipment.refining !== 0"
      class="ml-1 text-blue-60"
    >
      +{{ equipment.refining }}
    </span>
  </cy-icon-text>
</template>

<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentKinds } from '@/lib/Character/CharacterEquipment/enums'

interface Props {
  equipment: CharacterEquipment
  selected?: boolean
  small?: boolean
  textColor?: string
}

withDefaults(defineProps<Props>(), {
  selected: false,
  small: false,
  textColor: 'default',
})
</script>
