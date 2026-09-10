<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { RegistletBuild } from '@/lib/Character/RegistletBuild'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import CharacterRegistletItem from './character-registlet-item.vue'

interface Props {
  registletBuild: RegistletBuild
  disabled: boolean
}

defineProps<Props>()

const { t } = useI18n()

const itemDetailVisible = ref(true)
</script>

<template>
  <div class="flex items-center space-x-2 py-3">
    <cy-button-check v-model:selected="itemDetailVisible">
      {{ t('character-simulator.registlet-build.show-detail') }}
    </cy-button-check>
  </div>
  <CardRowsWrapper class="max-w-xl pb-1 pt-0.5" :class="itemDetailVisible ? 'pb-1.5' : 'pb-0.5'">
    <CardRows v-if="registletBuild.items.length > 0" :class="{ 'opacity-50': disabled }">
      <CharacterRegistletItem
        v-for="item in registletBuild.items"
        :key="item.base.id"
        :item="item"
        :detail-visible="itemDetailVisible"
      />
    </CardRows>
    <cy-default-tips v-else>
      {{ t('character-simulator.registlet-build.default-tips') }}
    </cy-default-tips>
  </CardRowsWrapper>
  <div class="space-y-1 pb-2 pt-6">
    <div>
      <div class="gap-icon text-primary-50 inline-flex items-start text-sm">
        <cy-icon icon="ic-outline-info" small class="text-primary-30 icon-first-line" />
        {{ t('character-simulator.registlet-build.main-tips-1') }}
      </div>
    </div>
    <div>
      <div class="gap-icon text-primary-50 inline-flex items-start text-sm">
        <cy-icon icon="ic-outline-info" small class="text-primary-30 icon-first-line" />
        {{ t('character-simulator.registlet-build.main-tips-2') }}
      </div>
    </div>
  </div>
</template>
