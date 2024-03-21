<script lang="ts" setup>
import { computed } from 'vue'

import { PotionBuild } from '@/lib/Character/PotionBuild'

import CharacterDashboardSideWrapper from './character-dashboard-side-wrapper.vue'

import { TabIds } from '../setup'

interface Props {
  potionBuild: PotionBuild
}

const props = defineProps<Props>()

const displayedItems = computed(() => {
  return props.potionBuild.items.filter(
    item => item.enabled && item.base.stats.length > 0
  )
})
</script>

<template>
  <CharacterDashboardSideWrapper
    icon="mdi:bottle-tonic-outline"
    :title="potionBuild.name"
    :tab-id="TabIds.Potion"
  >
    <div class="space-y-1.5">
      <div
        v-for="potion in displayedItems"
        :key="potion.base.id"
        class="flex items-center"
      >
        {{ potion.base.name }}
        <div class="ml-2 text-sm text-primary-40">
          {{ potion.belongCategory.base.name }}
        </div>
      </div>
    </div>
  </CharacterDashboardSideWrapper>
</template>
