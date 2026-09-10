<script lang="ts" setup>
import { computed } from 'vue'

import { CharacterEquipment, EquipmentKinds } from '@/lib/Character/CharacterEquipment'

import BrowseEquipmentsItemWrapper from './browse-equipments-item-wrapper.vue'

import { getCrystalClasses } from './setup'

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

const firstCrystalClass = computed(() => getCrystalClasses(props.equipment.crystals[0]))
const secondCrystalClass = computed(() => getCrystalClasses(props.equipment.crystals[1]))
</script>

<template>
  <div class="p-1.5">
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
        class="text-red-60 absolute -right-2.5 -top-2.5 bg-white"
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
        <span
          v-if="equipment.supportRefining && equipment.refining !== 0"
          class="text-blue-60 ml-0.5"
        >
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
  </div>
</template>

<style scoped>
@reference "@/tailwind.css";

.items-root {
  display: inline-flex;
  position: relative;
  flex-direction: column;
  transition-duration: 150ms;
  cursor: pointer;
  border-width: 2px;
  border-color: var(--color-primary-10);
  border-radius: var(--radius-sm);
  padding: --spacing(2);
  padding-bottom: --spacing(0.5);
  width: 4.5rem;
  height: 4.5rem;

  &:hover {
    border-color: var(--color-primary-40);
  }

  &.selected {
    border-color: var(--color-primary-50);
  }

  &.equipped {
    border-color: var(--color-red-50);
  }

  &.invalid {
    border-color: var(--color-gray-10);
    background-color: var(--color-gray-10);

    &:hover {
      border-color: var(--color-gray-40);
    }
  }
}

.item-enhancer::before {
  display: block;
  position: absolute;
  top: --spacing(0);
  right: --spacing(0);
  border-radius: 0 0.75rem 0.75rem 0;
  background-color: var(--color-gray-50);
  width: --spacing(1.5);
  height: --spacing(3);
  content: '';
}
</style>
