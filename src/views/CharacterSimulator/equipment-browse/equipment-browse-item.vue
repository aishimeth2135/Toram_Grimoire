<script lang="ts" setup>
import { computed } from 'vue'
import { useCssModule } from 'vue'

import {
  CharacterEquipment,
  EquipmentCrystal,
  EquipmentKinds,
} from '@/lib/Character/CharacterEquipment'

import { getCrystalPureColor } from './setup'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const classes = useCssModule()

const handleCrystalClass = (crystal: EquipmentCrystal | undefined) => {
  if (!crystal) {
    return null
  }
  const res = [`bg-${getCrystalPureColor(crystal.origin)}-40`]
  if (crystal.origin.enhancer) {
    res.push(classes.enhancer)
  }
  return res
}

const firstCrystalClass = computed(() =>
  handleCrystalClass(props.equipment.crystals[0])
)
const secondCrystalClass = computed(() =>
  handleCrystalClass(props.equipment.crystals[1])
)
</script>

<template>
  <div :class="classes.root">
    <cy-icon
      v-if="!equipment.is(EquipmentKinds.Avatar)"
      :icon="equipment.getCategoryImagePath()"
      width="2.25rem"
      class="flex-shrink-0"
    />
    <cy-icon
      v-else
      :icon="equipment.categoryIcon"
      width="2.25rem"
      class="flex-shrink-0"
    />
    <div class="mt-auto flex w-full items-center text-sm">
      <span class="text-primary-70">{{ equipment.basicValue }}</span>
      <span
        v-if="equipment.hasRefining && equipment.refining !== 0"
        class="ml-0.5 text-blue-60"
      >
        {{ `+${equipment.refining}` }}
      </span>
    </div>
    <div
      v-if="firstCrystalClass"
      :class="firstCrystalClass"
      class="absolute right-1.5 top-2 h-3 w-3 rounded-full"
    />
    <div
      v-if="secondCrystalClass"
      :class="secondCrystalClass"
      class="absolute right-1.5 top-6 h-3 w-3 rounded-full"
    />
  </div>
</template>

<style lang="postcss" module>
.root {
  @apply relative inline-flex cursor-pointer flex-col rounded border border-primary-20 p-2 pb-0.5 duration-150 hover:border-primary-40;
  height: 4.5rem;
  width: 4.5rem;
}

.enhancer::before {
  @apply absolute right-0 top-0 block h-3 w-1.5 bg-gray-50;
  content: '';
  border-radius: 0 0.75rem 0.75rem 0;
}
</style>
