<script lang="ts" setup>
import { computed } from 'vue'

import { EquipmentField } from '@/lib/Character/Character'

import ShowStat from '@/components/common/show-stat.vue'

import CharacterEquipmentTraitTitle from '../character-equipment-details/character-equipment-trait-title.vue'
import CommonEquipmentIcon from '../common/common-equipment-icon.vue'

interface Props {
  equipmentField: EquipmentField
}

const props = defineProps<Props>()

const equipment = computed(() => props.equipmentField.equipment)
</script>

<template>
  <div v-if="equipment" class="flex-start flex px-5 py-4">
    <div class="shrink-0">
      <CommonEquipmentIcon :equipment="equipment" width="1.375rem" />
    </div>
    <div class="ml-3 mt-0.5">
      <div>
        {{ equipment.name }}
        <span
          v-if="equipment.supportRefining && equipment.refining > 0"
          class="text text-blue-70 ml-2 inline-flex items-center"
        >
          <span class="text-primary-60 mr-0.5">{{ equipment.basicValue }}</span>
          {{ `+${equipment.refiningText}` }}
        </span>
      </div>
      <div v-if="equipment.stats.length > 0" class="mt-2">
        <ShowStat v-for="stat in equipment.stats" :key="stat.statId" :stat="stat" />
      </div>
      <div v-if="equipment.trait" class="mt-2">
        <CharacterEquipmentTraitTitle :equipment-trait="equipment.trait" />
      </div>
      <div v-if="equipment.crystals.length > 0" class="mt-2 flex flex-wrap items-center">
        <div v-for="crystal in equipment.crystals" :key="crystal.id" class="mr-3 flex items-center">
          <cy-icon :icon="crystal.crystalIconPath" />
          <span class="text-cyan-60 ml-1 text-sm">{{ crystal.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
