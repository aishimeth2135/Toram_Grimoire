<template>
  <div class="sticky bottom-2 z-10 mx-2 mt-4">
    <div class="bg-white border-1 border-solid border-light-2 rounded-lg px-3 py-1 mb-3 overflow-y-auto space-x-2">
      <cy-button-inline
        :icon="mode === 'skill' ? 'bx:bxs-book-bookmark' : 'bx:bx-star'"
        @click="mode = mode === 'skill' ? 'star-gem' : 'skill'"
      >
        {{ mode === 'skill' ? t('skill-simulator.skill-level') : t('skill-simulator.star-gem-level') }}
      </cy-button-inline>
      <cy-button-inline
        :icon="`mdi:numeric-${levelUnit}-circle-outline`"
        @click="toggleLevelUnit"
      >
        {{ `Lv.${levelUnit}` }}
      </cy-button-inline>
      <cy-button-inline
        :icon="increase ? 'ic:round-add-circle-outline' : 'ic:round-remove-circle-outline'"
        @click="increase = !increase"
      >
        {{ increase ? t('skill-simulator.increase-level') : t('skill-simulator.decrease-level') }}
      </cy-button-inline>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { MenuMode, MenuData } from './setup'

interface Emits {
  (evt: 'update-menu-data', data: MenuData): void;
}
const emit = defineEmits<Emits>()

const { t } = useI18n()

const mode = ref<MenuMode>('skill')
const levelUnit = ref(5)
const increase = ref(true)

const levelUnitList = [1, 5, 10]
const toggleLevelUnit = () => {
  const idx = levelUnitList.indexOf(levelUnit.value) + 1
  levelUnit.value = levelUnitList[idx === levelUnitList.length ? 0 : idx]
}

watch([mode, levelUnit, increase], ([newMode, newLevelUnit, newIncrease]) => {
  emit('update-menu-data', {
    levelUnit: newLevelUnit * (newIncrease ? 1 : -1),
    mode: newMode,
  })
})
</script>
