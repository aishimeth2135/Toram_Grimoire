<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

interface Props {
  equipment: CharacterEquipment
}

defineProps<Props>()
</script>

<template>
  <div class="text-primary-80 flex h-9 items-center">
    {{ equipment.name }}
    <span
      v-if="equipment.supportRefining && equipment.refining > 0"
      class="text text-blue-70 ml-2 inline-flex items-center"
    >
      <span class="text-primary-60 mr-0.5">
        {{ equipment.basicValue }}
      </span>
      {{ `+${equipment.refiningText}` }}
    </span>
  </div>
</template>
