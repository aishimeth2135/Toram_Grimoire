<template>
  <EnchantDollStepWrapper :step-id="StepIds.SelectNegativeStat">
    <div>
      <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
        {{ t('enchant-doll.select-negatives.title') }}
      </cy-icon-text>
    </div>
    <div class="mt-1 pb-2 pl-4 text-sm">
      {{ t('enchant-doll.select-negatives.caption') }}
    </div>
    <div class="ml-4 mr-2 mt-1">
      <cy-icon-text
        icon="ic-outline-info"
        small
        text-color="blue-60"
        icon-color="blue-30"
      >
        {{ t('enchant-doll.tips.performance.auto-find-negatives') }}
      </cy-icon-text>
    </div>
    <div v-if="currentEquipmentType !== 1" class="ml-4 mr-2 mt-1">
      <cy-icon-text
        icon="ic-outline-info"
        small
        text-color="blue-60"
        icon-color="blue-30"
      >
        {{ t('enchant-doll.select-negatives.tips-1') }}
      </cy-icon-text>
    </div>
    <div v-if="equipmentState.autoFindPotentialMinimum" class="ml-4 mr-2 mt-1">
      <cy-icon-text
        icon="ic-outline-info"
        small
        text-color="blue-60"
        icon-color="blue-30"
      >
        <!-- prettier-ignore -->
        {{ t('enchant-doll.tips.performance.auto-find-original-potential-minimum-and-auto-find-negatives') }}
      </cy-icon-text>
    </div>
    <div class="mb-6 mt-4 flex flex-col items-center">
      <div>
        <cy-button-check v-model:selected="negativeStatsState.auto">
          {{ t('enchant-doll.select-negatives.auto-select') }}
        </cy-button-check>
      </div>
      <div>
        <cy-button-toggle
          v-if="currentEquipmentType !== 1"
          v-model:selected="doll.config.containsNaturalMpRegenConstant"
        >
          <span class="text-primary-30">
            <!-- prettier-ignore -->
            {{ t('enchant-doll.select-negatives.contains-natural-mp-regen-constant') }}
          </span>
        </cy-button-toggle>
      </div>
    </div>
    <template v-if="negativeStatsState.auto">
      <template v-if="currentEquipmentType === 1">
        <div>
          <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
            <!-- prettier-ignore -->
            {{ t('enchant-doll.select-negatives.select-config.base-type.title') }}
          </cy-icon-text>
        </div>
        <div class="mt-1 pl-4 text-sm">
          <!-- prettier-ignore -->
          {{ t('enchant-doll.select-negatives.select-config.base-type.caption') }}
        </div>
        <div class="flex flex-wrap justify-center py-4 pl-2">
          <cy-button-radio
            v-for="option in dollConfigOptions.baseType"
            :key="option"
            :selected="doll.config.baseType === option"
            @click="doll.config.baseType = option"
          >
            <!-- prettier-ignore -->
            {{ t('enchant-doll.select-negatives.select-config.base-type.option-texts.' + option) }}
          </cy-button-radio>
        </div>
      </template>
      <div>
        <cy-icon-text icon="gg-menu-left-alt" text-color="fuchsia-60">
          <!-- prettier-ignore -->
          {{ t('enchant-doll.select-negatives.select-config.auto-find-negatives.title') }}
        </cy-icon-text>
      </div>
      <div class="mt-1 pl-4 text-sm">
        <!-- prettier-ignore -->
        {{ t('enchant-doll.select-negatives.select-config.auto-find-negatives.caption') }}
      </div>
      <div class="flex flex-wrap justify-center py-4 pl-2">
        <cy-button-radio
          v-for="option in dollConfigOptions.autoFindNegaitveStatsType"
          :key="option"
          :selected="doll.config.autoFindNegaitveStatsType === option"
          @click="doll.config.autoFindNegaitveStatsType = option"
        >
          <!-- prettier-ignore -->
          {{ t('enchant-doll.select-negatives.select-config.auto-find-negatives.option-texts.' + option) }}
        </cy-button-radio>
      </div>
    </template>
    <div
      v-if="
        negativeStatsState.auto &&
        autoNegativeStats.length < doll.numNegativeStats
      "
      class="mt-4 flex justify-center"
    >
      <div>
        <cy-icon-text small icon-color="blue-60" class="mr-4">
          {{ t('enchant-doll.select-negatives.auto-select') }}
        </cy-icon-text>
        <cy-icon-text small>
          {{ t('enchant-doll.select-negatives.manually-selected') }}
        </cy-icon-text>
      </div>
    </div>
    <div class="mb-4 flex justify-center">
      <div class="mt-2 max-w-xs border border-fuchsia-60">
        <template v-if="negativeStats.length !== 0">
          <cy-list-item v-for="stat in negativeStats" :key="stat.statId">
            <cy-icon-text
              :text-color="stat.value >= 0 ? 'primary-90' : 'orange-60'"
              :icon-color="
                autoNegativeStats.includes(stat) ? 'blue-60' : 'primary-30'
              "
              class="w-full"
            >
              {{ stat.showAmount() }}
            </cy-icon-text>
            <div class="mt-1 flex w-full flex-wrap items-center">
              <cy-input-counter
                v-model:value="stat.value"
                :disabled="autoNegativeStats.includes(stat)"
                inline
                max-button
                min-button
                :range="[stat.limit.min, -1]"
              />
              <cy-button-icon
                :disabled="autoNegativeStats.includes(stat)"
                icon="jam-close-circle"
                color="gray"
                class="ml-auto"
                @click="removeNegativeStat(stat)"
              />
            </div>
          </cy-list-item>
        </template>
        <cy-default-tips
          v-else
          icon="fluent-leaf-two-16-regular"
          class="mx-6 my-4"
        >
          {{ t('enchant-doll.tips.no-stat-selected') }}
        </cy-default-tips>
      </div>
    </div>
    <div
      v-if="
        !negativeStatsState.auto || negativeStats.length < doll.numNegativeStats
      "
      class="text-center"
    >
      <cy-button-action
        icon="ic-round-add-circle-outline"
        @click="openSelectItem(SelectItemModes.Negative)"
      >
        {{ t('enchant-doll.select-item') }}
      </cy-button-action>
      <div
        v-if="
          negativeStatsState.auto &&
          autoNegativeStats.length < doll.numNegativeStats
        "
        class="mt-2"
      >
        <div>
          <cy-icon-text
            icon="ic-outline-info"
            small
            text-color="blue-60"
            icon-color="blue-30"
          >
            <!-- prettier-ignore -->
            {{ t('enchant-doll.select-negatives.stats-from-auto-not-enough.0') }}
          </cy-icon-text>
        </div>
        <div class="text-sm text-blue-60">
          {{ t('enchant-doll.select-negatives.stats-from-auto-not-enough.1') }}
        </div>
      </div>
    </div>
  </EnchantDollStepWrapper>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

import { EnchantEquipmentTypes } from '@/lib/Enchant/Enchant'
import {
  AutoFindNegaitveStatsTypes,
  EnchantDollBaseTypes,
} from '@/lib/Enchant/EnchantDoll'

import EnchantDollStepWrapper from './enchant-doll-step-wrapper.vue'

import { EnchantDollInjectionKey } from './injection-keys'
import { SelectItemModes, StepIds } from './setup'

const {
  doll,
  openSelectItem,
  negativeStats,
  autoNegativeStats,
  negativeStatsState,
  equipmentState,
  removeNegativeStat,
} = inject(EnchantDollInjectionKey)!
const { t } = useI18n()

const dollConfigOptions = {
  baseType: [
    EnchantDollBaseTypes.Physical,
    EnchantDollBaseTypes.Magic,
    EnchantDollBaseTypes.None,
  ],
  autoFindNegaitveStatsType: [
    AutoFindNegaitveStatsTypes.SuccessRate,
    AutoFindNegaitveStatsTypes.Material,
  ],
}

const currentEquipmentType = computed(() => {
  const eq = doll.value.build.equipment
  if (eq?.fieldType === EnchantEquipmentTypes.MainWeapon) {
    return eq.isOriginalElement ? 2 : 0
  }
  return 1
})
</script>
