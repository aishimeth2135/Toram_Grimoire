<script lang="ts" setup>
import { computed } from 'vue'

import { RegistletBuild } from '@/lib/Character/RegistletBuild'
import { StatBase } from '@/lib/Character/Stat'

import CharacterDashboardSideWrapper from './character-dashboard-side-wrapper.vue'

import { TabIds } from '../setup'

interface Props {
  registletBuild: RegistletBuild
}

const props = defineProps<Props>()

const displayedItems = computed(() => {
  return props.registletBuild.items.filter(
    item => item.enabled && item.base.link instanceof StatBase
  )
})
</script>

<template>
  <CharacterDashboardSideWrapper
    icon="game-icons:beveled-star"
    :title="registletBuild.name"
    :tab-id="TabIds.Registlet"
  >
    <div class="space-y-1.5">
      <div
        v-for="item in displayedItems"
        :key="item.base.id"
        class="flex items-center"
      >
        {{ item.base.name }}
        <div class="ml-2 text-primary-60">
          {{ `Lv.${item.level}` }}
        </div>
      </div>
    </div>
  </CharacterDashboardSideWrapper>
</template>
