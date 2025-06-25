<template>
  <AppLayoutMain class="h-full">
    <div class="flex h-full w-full items-center justify-center">
      <cy-icon
        :icon="mainStore.devMode ? 'mdi:weather-partly-cloudy' : 'mdi:weather-night-partly-cloudy'"
        width="5rem"
        @click="iconClick"
      />
    </div>
  </AppLayoutMain>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import { useMainStore } from '@/stores/app/main'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'

const clickCount = ref(0)

const mainStore = useMainStore()

const iconClick = () => {
  if (clickCount.value < 10) {
    clickCount.value += 1
    return
  }
  mainStore.devMode = !mainStore.devMode
}
</script>
