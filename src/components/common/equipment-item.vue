<template>
  <cy-list-item :class="{ 'opacity-50': disabled }" :selected="selected">
    <cy-icon-text
      :icon="equipment.is !== 'avatar' ? equipment.getCategoryImagePath() : equipment.categoryIcon"
      :icon-src="equipment.is !== 'avatar' ? 'image' : 'iconify'"
    >
      <span :class="{ 'text-purple': current }">{{ equipment.name }}</span>
      <span
        v-if="equipment.hasRefining && equipment.refining != 0"
        class="ml-1 text-water-blue"
      >
        +{{ equipment.refining }}
      </span>
    </cy-icon-text>
    <cy-icon-text
      v-if="current"
      icon="carbon-location-current"
      class="ml-auto"
      icon-color="purple"
    />
    <slot name="extra" />
  </cy-list-item>
</template>
<script>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment';
export default {
  props: {
    equipment: {
      type: CharacterEquipment,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    current: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
