<template>
  <EnchantDollStepWrapper v-if="resultEquipment" :step-id="StepIds.Result">
    <div>
      <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
        {{ t('enchant-doll.result.title') }}
      </cy-icon-text>
    </div>
    <div class="mt-1 pl-4 text-sm">
      {{ t('enchant-doll.result.caption') }}
    </div>
    <div
      v-if="equipmentState.autoFindPotentialMinimum"
      class="mt-6 flex items-center justify-center"
    >
      <cy-icon-text icon="bx-bx-star" class="mr-3">
        {{ t('enchant-doll.result.current-potential-is') }}
      </cy-icon-text>
      <span class="text-fuchsia-60">
        {{ doll.build.equipment.originalPotential }}
      </span>
    </div>
    <div
      v-if="
        equipmentState.autoFindPotentialMinimum &&
        resultEquipment.originalPotential ===
          AUTO_FIND_POTENTIAL_MIMUMUM_UPPER_LIMIT &&
        resultEquipment.realSuccessRate < 100
      "
      class="mt-2 flex justify-center"
    >
      <cy-icon-text
        icon="ic-outline-info"
        small
        text-color="blue-60"
        icon-color="blue-30"
      >
        {{
          t('enchant-doll.tips.cannot-auto-find-original-potential-minimum', {
            limit: AUTO_FIND_POTENTIAL_MIMUMUM_UPPER_LIMIT,
          })
        }}
      </cy-icon-text>
    </div>
    <div class="mb-4 mt-6 flex justify-center">
      <div
        class="rounded-lg border-1 border-fuchsia-60 bg-white pb-5 pl-4 pr-6 pt-3"
      >
        <EnchantResult :equipment="resultEquipment" />
      </div>
    </div>
    <div class="mt-6">
      <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
        {{ t('enchant-doll.export-result.title') }}
      </cy-icon-text>
    </div>
    <div class="mt-1 pl-4 text-sm">
      {{ t('enchant-doll.export-result.caption') }}
    </div>
    <div class="mt-4 flex justify-center">
      <cy-title-input
        v-if="!exportState.hasExport"
        v-model:value="exportState.name"
        class="max-w-sm"
      />
    </div>
    <div class="my-2 flex justify-center">
      <cy-button-action
        v-if="!exportState.hasExport"
        icon="ic-outline-save"
        color="cyan"
        @click="exportResult"
      >
        {{ t('global.export') }}
      </cy-button-action>
      <cy-button-action
        v-else
        icon="ic-round-open-in-new"
        color="cyan"
        @click="$router.replace('/enchant')"
      >
        {{ t('enchant-doll.export-result.redirect-to-enchant-simulator') }}
      </cy-button-action>
    </div>
    <template v-if="doll.lastResults.length > 1">
      <div class="flex justify-center pt-4">
        <cy-button-plain
          v-model:selected="selectOtherResults"
          :icon="
            selectOtherResults
              ? 'akar-icons:circle-chevron-up'
              : 'akar-icons:circle-chevron-down'
          "
          color="secondary"
        >
          {{ t('enchant-doll.result.select-other-result') }}
        </cy-button-plain>
      </div>
      <CardRowsWrapper
        v-if="selectOtherResults"
        class="mt-3 divide-y divide-primary-20 px-0.5"
      >
        <CardRows v-for="(result, idx) in doll.lastResults" :key="idx">
          <EnchantDollResultItem
            :result="result"
            :is-current="result === resultEquipment"
            @select-result="resultEquipment = $event"
          />
        </CardRows>
      </CardRowsWrapper>
    </template>
  </EnchantDollStepWrapper>
</template>

<script lang="ts" setup>
import { inject, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useEnchantStore } from '@/stores/views/enchant'

import Grimoire from '@/shared/Grimoire'

import { EnchantBuild } from '@/lib/Enchant/Enchant'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import EnchantResult from '../EnchantSimulator/enchant-result.vue'
import EnchantDollResultItem from './enchant-doll-result-item.vue'
import EnchantDollStepWrapper from './enchant-doll-step-wrapper.vue'

import { EnchantDollInjectionKey } from './injection-keys'
import { AUTO_FIND_POTENTIAL_MIMUMUM_UPPER_LIMIT, StepIds } from './setup'

const store = useEnchantStore()
const selectOtherResults = ref(false)

const { doll, equipmentState, resultEquipment } = inject(
  EnchantDollInjectionKey
)!
const { t } = useI18n()

const exportState = reactive({
  hasExport: false,
  name: t('enchant-doll.export-result.build-default-name'),
})

const exportResult = () => {
  if (!resultEquipment.value) {
    return
  }
  const build = new EnchantBuild(
    exportState.name,
    resultEquipment.value.clone(Grimoire.Enchant.categorys)
  )
  store.exportDollBuild(build)
  exportState.hasExport = true
}
</script>
