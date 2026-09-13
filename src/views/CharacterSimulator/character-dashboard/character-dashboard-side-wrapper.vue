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
  <div class="relative flex w-full items-start p-4 pr-8 pb-6">
    <cy-button-icon icon="mdi:square-edit-outline" class="absolute top-2 right-2" @click="goTab" />
    <div
      class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary-10"
    >
      <cy-icon :icon="icon" width="1.375rem" />
    </div>
    <div class="w-full pt-1.5 pl-4">
      <div class="mr-4 -ml-1 border-b border-primary-10 px-1 text-primary-80">
        {{ title }}
      </div>
      <div class="pt-4">
        <slot />
      </div>
    </div>
  </div>
</template>
