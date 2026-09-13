<script lang="ts" setup>
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import { getEquipmentLabelColorClasses } from '../common/equipment-label-colors'

interface Props {
  equipment: CharacterEquipment
}

defineProps<Props>()
</script>

<template>
  <div v-if="equipment.labels.length > 0" class="flex flex-wrap items-center text-xs">
    <div
      v-for="label in equipment.labels"
      :key="label.id"
      class="mr-2.5 flex items-center"
      :class="getEquipmentLabelColorClasses(label.color).text"
    >
      <div
        class="mr-1 size-2.5 shadow-xs"
        :class="getEquipmentLabelColorClasses(label.color).background"
      />
      <div class="px-0.5">
        {{ label.text }}
      </div>
    </div>
  </div>
</template>
