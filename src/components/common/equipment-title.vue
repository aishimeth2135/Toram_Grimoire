<template>
  <cy-icon-text
    :icon="equipment.is !== 'avatar' ? equipment.getCategoryImagePath() : equipment.categoryIcon"
    :icon-src="equipment.is !== 'avatar' ? 'image' : 'iconify'"
    :small="small"
    :text-color="textColor"
  >
    <div class="text-ellipsis inline-block" style="max-width: 12rem">{{ equipment.name }}</div>
    <span
      v-if="equipment.hasRefining && equipment.refining !== 0"
      class="ml-1 text-water-blue"
    >
      +{{ equipment.refining }}
    </span>
  </cy-icon-text>
</template>

<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

interface Props {
  equipment: CharacterEquipment;
  selected?: boolean;
  small?: boolean;
  textColor?: string;
}

withDefaults(defineProps<Props>(), {
  selected: false,
  small: false,
  textColor: 'default',
})
</script>
