<template>
  <cy-list-item :selected="selected">
    <div class="flex items-center w-full" :class="{ 'opacity-50': disabled }">
      <cy-icon-text
        :icon="equipment.is !== 'avatar' ? equipment.getCategoryImagePath() : equipment.categoryIcon"
        :icon-src="equipment.is !== 'avatar' ? 'image' : 'iconify'"
      >
        <span :class="{ 'text-purple': current }">{{ equipment.name }}</span>
        <span
          v-if="equipment.hasRefining && equipment.refining !== 0"
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
      <slot name="title-end" />
    </div>
    <div class="w-full">
      <slot name="content" />
    </div>
  </cy-list-item>
</template>

<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

interface Props {
  equipment: CharacterEquipment;
  disabled?: boolean;
  current?: boolean;
  selected?: boolean;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  current: false,
  selected: false,
})
</script>
