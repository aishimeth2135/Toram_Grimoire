<script lang="ts" setup>
import { computed } from 'vue'

import type { BagCrystal } from '@/lib/Items/BagItem'

import CardRow from '@/components/card/card-row.vue'
import ShowStat from '@/components/common/show-stat.vue'

interface Props {
  equipmentRelatedCrystals: BagCrystal[]
  crystal: BagCrystal
  selected: boolean
  showCrystalStats: boolean
}

const props = defineProps<Props>()

const optionDisabled = computed(() => {
  const checkEnchaner = !props.equipmentRelatedCrystals.some(
    relatedCrystal => relatedCrystal.name === props.crystal.name
  )

  return !checkEnchaner
})
</script>

<template>
  <CardRow
    :class="[{ 'opacity-50': optionDisabled }, 'flex cursor-pointer items-center px-4 py-2']"
    :item="crystal"
    :disabled="optionDisabled"
    hover
  >
    <div>
      <div class="flex items-center">
        <cy-icon
          :icon="selected ? 'ic:round-check-circle' : 'mdi:circle-outline'"
          :class="[{ 'opacity-50': !selected }, 'mr-3']"
        />
        <cy-icon :icon="crystal.crystalIconPath" class="mr-1.5" />
        {{ crystal.name }}
      </div>
      <div v-if="showCrystalStats" class="mt-1 pl-8">
        <ShowStat
          v-for="stat in crystal.stats"
          :key="stat.statId"
          :stat="stat"
          :negative-value="stat.value < 0"
          class="text-sm"
        />
      </div>
    </div>
  </CardRow>
</template>
