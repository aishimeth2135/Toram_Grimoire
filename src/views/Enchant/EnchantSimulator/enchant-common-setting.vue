<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { useEnchantStore } from '@/stores/views/enchant'

const store = useEnchantStore()
const { config } = storeToRefs(store)

const { t, tm } = useI18n()

const materialTitleList = tm('enchant-simulator.material-point-type-list') as string[]
const materialTypes = [0, 1, 2, 3, 4, 5]
</script>

<template>
  <div>
    <div class="text-sm text-gray-50">
      {{ t('enchant-simulator.common-options') }}
    </div>
    <div class="space-y-2 py-2">
      <cy-input-counter
        v-model:value="config.characterLevel"
        :step="10"
        :title="t('enchant-simulator.character-level')"
      />
      <cy-input-counter
        v-model:value="config.smithLevel"
        :step="10"
        :title="t('enchant-simulator.smith-level')"
      />
    </div>
    <div class="mt-2 text-sm text-gray-50">
      {{ t('enchant-simulator.skill-level-options') }}
    </div>
    <div class="space-y-2 py-2">
      <cy-input-counter
        v-for="materialType in materialTypes"
        :key="materialType"
        v-model:value="config.materialSkillLevels[materialType]"
        :range="[0, 10]"
        :title="materialTitleList[materialType]"
      />
    </div>
  </div>
</template>
