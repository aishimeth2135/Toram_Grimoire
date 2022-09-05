<template>
  <cy-list-item :selected="selected">
    <div class="flex items-center w-full" :class="{ 'opacity-50': disabled }">
      <EquipmentTitle :equipment="equipment" :text-color="current ? 'fuchsia' : 'primary-90'" />
      <cy-icon-text
        v-if="current"
        icon="carbon-location-current"
        class="ml-auto"
        icon-color="fuchsia-60"
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

import EquipmentTitle from './equipment-title.vue'

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
