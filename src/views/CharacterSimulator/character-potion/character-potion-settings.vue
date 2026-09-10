<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { PotionBuild } from '@/lib/Character/PotionBuild'

import CharacterPotionCategory from './character-potion-category.vue'

interface Props {
  potionBuild: PotionBuild
  disabled: boolean
}

defineProps<Props>()

const { t } = useI18n()

const itemDetailVisible = ref(true)
</script>

<template>
  <div class="flex items-center py-2">
    <cy-button-check v-model:selected="itemDetailVisible">
      {{ t('character-simulator.registlet-build.show-detail') }}
    </cy-button-check>
  </div>
  <div
    v-if="potionBuild.items.length > 0"
    class="max-w-2xl space-y-4 pt-1.5"
    :class="{ 'opacity-50': disabled }"
  >
    <CharacterPotionCategory
      v-for="category in potionBuild.categorys"
      :key="category.base.id"
      :category="category"
      :detail-visible="itemDetailVisible"
    />
  </div>
  <cy-default-tips v-else>
    {{ t('character-simulator.potion-build.default-tips') }}
  </cy-default-tips>
</template>
