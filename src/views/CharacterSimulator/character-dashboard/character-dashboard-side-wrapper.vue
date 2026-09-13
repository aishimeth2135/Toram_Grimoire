<script lang="ts" setup>
import { CharacterSimulatorRouteNames } from '@/router/Character'

import { useCharacterSimulatorState } from '../setup'

interface Props {
  title: string
  icon: string
  tabPathName?: CharacterSimulatorRouteNames
}

const props = defineProps<Props>()

const { setCurrentTab } = useCharacterSimulatorState()

const goTab = () => {
  if (props.tabPathName) {
    setCurrentTab(props.tabPathName)
  }
}
</script>

<template>
  <div class="relative flex w-full items-start p-4 pb-6 pr-8">
    <cy-button-icon icon="mdi:square-edit-outline" class="absolute right-2 top-2" @click="goTab" />
    <div
      class="border-primary-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2"
    >
      <cy-icon :icon="icon" width="1.375rem" />
    </div>
    <div class="w-full pl-4 pt-1.5">
      <div class="border-primary-10 text-primary-80 -ml-1 mr-4 border-b px-1">
        {{ title }}
      </div>
      <div class="pt-4">
        <slot />
      </div>
    </div>
  </div>
</template>
