<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CharacterEquipmentDetails from '../character-equipment-details/character-equipment-details.vue'

interface Props {
  equipment: CharacterEquipment
  equipped: boolean
}

defineProps<Props>()
</script>

<template>
  <cy-popover placement="right-start" triggers="hover" custom>
    <slot />
    <template #popper>
      <CharacterEquipmentDetails
        :equipment="equipment"
        :equipped="equipped"
        class="m-3"
      />
    </template>
  </cy-popover>
</template>
