<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

interface Props {
  equipment: CharacterEquipment
}

defineProps<Props>()
</script>

<template>
  <div
    v-if="equipment.labels.length > 0"
    class="flex flex-wrap items-center text-xs"
  >
    <div
      v-for="label in equipment.labels"
      :key="label.id"
      class="mr-2.5 flex items-center"
      :class="`text-${label.color}-60`"
    >
      <div
        class="mr-1 h-2.5 w-2.5 rounded-sm"
        :class="`bg-${label.color}-50`"
      />
      <div class="px-0.5">
        {{ label.text }}
      </div>
    </div>
  </div>
</template>
