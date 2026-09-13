<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CommonEquipmentIcon from './common-equipment-icon.vue'

interface Props {
  equipment: CharacterEquipment
  equipped?: boolean
}

withDefaults(defineProps<Props>(), {
  equipped: false,
})
</script>

<template>
  <div
    class="relative flex size-9 shrink-0 items-center justify-center rounded-full border-2"
    :class="equipped ? 'border-primary-40' : 'border-primary-10'"
  >
    <CommonEquipmentIcon :equipment="equipment" width="1.25rem" />
    <cy-icon
      v-if="equipped"
      icon="ic:round-check-circle"
      class="absolute -top-1.5 -right-1.5 bg-white text-red-60"
    />
  </div>
</template>
