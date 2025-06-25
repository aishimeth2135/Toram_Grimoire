<script lang="ts" setup>
import { computed } from 'vue'

import {
  CharacterEquipment,
  EquipmentCrystal,
  EquipmentKinds,
} from '@/lib/Character/CharacterEquipment'

import BrowseEquipmentsItemWrapper from './browse-equipments-item-wrapper.vue'

import { getCrystalPureColor } from './setup'

interface Props {
  equipment: CharacterEquipment
  selected?: boolean
  equipped?: boolean
  invalid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  equipped: false,
  invalid: false,
})

const handleCrystalClass = (crystal: EquipmentCrystal | undefined) => {
  if (!crystal) {
    return null
  }
  const res = [`bg-${getCrystalPureColor(crystal.origin)}-40`]
  if (crystal.origin.enhancer) {
    res.push('item-enhancer')
  }
  return res
}

const firstCrystalClass = computed(() => handleCrystalClass(props.equipment.crystals[0]))
const secondCrystalClass = computed(() => handleCrystalClass(props.equipment.crystals[1]))
</script>

<template>
  <BrowseEquipmentsItemWrapper
    :equipment="equipment"
    :equipped="equipped"
    class="items-root"
    :class="{
      selected: selected,
      invalid: invalid,
      equipped: equipped,
    }"
  >
    <cy-icon
      v-if="equipped"
      icon="ic:round-check-circle"
      class="absolute -right-2.5 -top-2.5 bg-white text-red-60"
    />
    <cy-icon
      :icon="
        !equipment.is(EquipmentKinds.Avatar)
          ? equipment.getCategoryImagePath()
          : equipment.categoryIcon
      "
      width="2.25rem"
      class="shrink-0"
    />
    <div class="mt-auto flex w-full items-center text-sm">
      <span class="text-primary-70">{{ equipment.basicValue }}</span>
      <span v-if="equipment.hasRefining && equipment.refining !== 0" class="ml-0.5 text-blue-60">
        {{ `+${equipment.refiningText}` }}
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
  </BrowseEquipmentsItemWrapper>
</template>

<style scoped>
@reference "@/tailwind.css";

.items-root {
  @apply relative inline-flex cursor-pointer flex-col rounded-sm border-1 border-primary-10 p-2 pb-0.5 duration-150 hover:border-primary-40;
  height: 4.5rem;
  width: 4.5rem;

  &.selected {
    @apply border-primary-50;
  }

  &.equipped {
    @apply border-red-50;
  }

  &.invalid {
    @apply border-stone-10 bg-stone-10 hover:border-stone-40;
  }
}

.item-enhancer::before {
  @apply absolute right-0 top-0 block h-3 w-1.5 bg-gray-50;
  content: '';
  border-radius: 0 0.75rem 0.75rem 0;
}
</style>
