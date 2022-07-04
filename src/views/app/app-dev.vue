<template>
  <AppLayoutMain class="h-full">
    <div class="h-full w-full flex items-center justify-center">
      <cy-icon-text
        :icon="mainStore.devMode ? 'mdi:weather-partly-cloudy' : 'mdi:weather-night-partly-cloudy'"
        icon-width="5rem"
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
