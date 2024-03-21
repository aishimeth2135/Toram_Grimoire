<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

interface Props {
  equipment: CharacterEquipment
}

defineProps<Props>()
</script>

<template>
  <div class="text-primary-80">
    {{ equipment.name }}
    <span
      v-if="equipment.hasRefining && equipment.refining > 0"
      class="text ml-2 inline-flex items-center text-blue-70"
    >
      <span class="mr-0.5 text-primary-60">
        {{ equipment.basicValue }}
      </span>
      {{ `+${equipment.refiningText}` }}
    </span>
  </div>
</template>
