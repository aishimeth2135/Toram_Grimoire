<script lang="ts" setup>
import { ref } from 'vue'

import type { EquipmentTraitItem } from '@/lib/EquipmentTrait'

import CardRow from '@/components/card/card-row.vue'

import CharacterEquipmentTraitCaption from './character-equipment-trait-caption.vue'

interface Props {
  traitItem: EquipmentTraitItem
  selected: boolean
}

defineProps<Props>()

const showDetail = ref(false)
</script>

<template>
  <CardRow class="flex cursor-pointer items-center px-4 py-2" :item="traitItem" hover>
    <div class="w-full">
      <div class="flex items-center">
        <cy-icon
          :icon="selected ? 'ic:round-check-circle' : 'mdi:circle-outline'"
          :class="[{ 'opacity-50': !selected }, 'mr-2.5']"
        />
        {{ traitItem.name }}
        <cy-button-icon
          :icon="showDetail ? 'mdi:chevron-up-circle-outline' : 'mdi:chevron-down-circle-outline'"
          class="ml-auto"
          @click="showDetail = !showDetail"
        />
      </div>
      <CharacterEquipmentTraitCaption
        v-if="showDetail"
        :trait-item="traitItem"
        class="text-gray-60 mt-1 pl-7 text-sm"
      />
    </div>
  </CardRow>
</template>
