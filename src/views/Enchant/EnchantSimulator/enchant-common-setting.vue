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
      <div class="flex flex-wrap items-center">
        <cy-button-check v-model:selected="config.hasExpertsCustomization2Skill">
          {{ t('enchant-simulator.experts-customization-2-skill') }}
        </cy-button-check>
        <div class="text-sm text-primary-30">
          {{ t('enchant-simulator.experts-customization-2-skill-desc') }}
        </div>
      </div>
      <div>
        <cy-input-counter
          v-model:value="config.materialAnvilSkillLevelSum"
          :step="5"
          :title="t('enchant-simulator.material-anvil-skill-level-sum')"
          :range="[0, 40]"
        />
        <div class="mt-1 text-sm text-primary-30">
          {{ t('enchant-simulator.material-anvil-skill-level-desc') }}
        </div>
      </div>
    </div>
    <div class="mt-2 text-sm text-gray-50">
      {{ t('enchant-simulator.material-skill-level-options') }}
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
