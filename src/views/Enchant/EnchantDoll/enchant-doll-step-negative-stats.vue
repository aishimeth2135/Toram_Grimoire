<template>
  <EnchantDollStepWrapper :step-id="StepIds.SelectNegativeStat">
    <div>
      <div class="gap-icon text-fuchsia-60 inline-flex items-center">
        <cy-icon icon="gg-menu-left-alt" class="text-primary-30" />
        {{ t('enchant-doll.select-negatives.title') }}
      </div>
    </div>
    <div class="mt-1 pb-2 pl-4 text-sm">
      {{ t('enchant-doll.select-negatives.caption') }}
    </div>
    <div class="ml-4 mr-2 mt-1">
      <div class="gap-icon text-blue-60 inline-flex items-center text-sm">
        <cy-icon icon="ic-outline-info" small class="text-blue-30" />
        {{ t('enchant-doll.tips.performance.auto-find-negatives') }}
      </div>
    </div>
    <div v-if="currentEquipmentType !== 1" class="ml-4 mr-2 mt-1">
      <div class="gap-icon text-blue-60 inline-flex items-center text-sm">
        <cy-icon icon="ic-outline-info" small class="text-blue-30" />
        {{ t('enchant-doll.select-negatives.tips-1') }}
      </div>
    </div>
    <div v-if="equipmentState.autoFindPotentialMinimum" class="ml-4 mr-2 mt-1">
      <div class="gap-icon text-blue-60 inline-flex items-center text-sm">
        <cy-icon icon="ic-outline-info" small class="text-blue-30" />
        <span>
          <!-- prettier-ignore -->
          {{ t('enchant-doll.tips.performance.auto-find-original-potential-minimum-and-auto-find-negatives') }}
        </span>
      </div>
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
          <div class="gap-icon text-fuchsia-60 inline-flex items-center">
            <cy-icon icon="gg-menu-left-alt" class="text-primary-30" />
            <span>
              <!-- prettier-ignore -->
              {{ t('enchant-doll.select-negatives.select-config.base-type.title') }}
            </span>
          </div>
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
        <div class="gap-icon text-fuchsia-60 inline-flex items-center">
          <cy-icon icon="gg-menu-left-alt" class="text-primary-30" />
          <span>
            <!-- prettier-ignore -->
            {{ t('enchant-doll.select-negatives.select-config.auto-find-negatives.title') }}
          </span>
        </div>
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
      v-if="negativeStatsState.auto && autoNegativeStats.length < doll.numNegativeStats"
      class="mt-4 flex justify-center"
    >
      <div>
        <div class="gap-icon text-primary-90 mr-4 inline-flex items-center text-sm">
          <cy-icon small class="text-blue-60" />
          {{ t('enchant-doll.select-negatives.auto-select') }}
        </div>
        <div class="gap-icon text-primary-90 inline-flex items-center text-sm">
          <cy-icon small class="text-primary-30" />
          {{ t('enchant-doll.select-negatives.manually-selected') }}
        </div>
      </div>
    </div>
    <div class="mb-4 flex justify-center">
      <div class="border-fuchsia-60 mt-2 max-w-xs border">
        <template v-if="negativeStats.length !== 0">
          <cy-list-item v-for="stat in negativeStats" :key="stat.statId">
            <div
              class="gap-icon inline-flex w-full items-center"
              :class="stat.value >= 0 ? 'text-primary-90' : 'text-orange-60'"
            >
              <cy-icon
                :class="autoNegativeStats.includes(stat) ? 'text-blue-60' : 'text-primary-30'"
              />
              {{ stat.showAmount() }}
            </div>
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
        <cy-default-tips v-else icon="fluent-leaf-two-16-regular" class="mx-6 my-4">
          {{ t('enchant-doll.tips.no-stat-selected') }}
        </cy-default-tips>
      </div>
    </div>
    <div
      v-if="!negativeStatsState.auto || negativeStats.length < doll.numNegativeStats"
      class="text-center"
    >
      <cy-button-action
        icon="ic-round-add-circle-outline"
        @click="openSelectItem(SelectItemModes.Negative)"
      >
        {{ t('enchant-doll.select-item') }}
      </cy-button-action>
      <div
        v-if="negativeStatsState.auto && autoNegativeStats.length < doll.numNegativeStats"
        class="mt-2"
      >
        <div>
          <div class="gap-icon text-blue-60 inline-flex items-center text-sm">
            <cy-icon icon="ic-outline-info" small class="text-blue-30" />
            <span>
              <!-- prettier-ignore -->
              {{ t('enchant-doll.select-negatives.stats-from-auto-not-enough.0') }}
            </span>
          </div>
        </div>
        <div class="text-blue-60 text-sm">
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
import { AutoFindNegaitveStatsTypes, EnchantDollBaseTypes } from '@/lib/Enchant/EnchantDoll'

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
  baseType: [EnchantDollBaseTypes.Physical, EnchantDollBaseTypes.Magic, EnchantDollBaseTypes.None],
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
